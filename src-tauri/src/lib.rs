use serde::Serialize;
use std::process::Command;
use sysinfo::{Pid, System};

#[derive(Debug, Clone, Serialize)]
struct PortInfo {
    port: u16,
    protocol: String,
    pid: u32,
    process_name: String,
    command: String,
    address: String,
}

fn get_listening_ports() -> Vec<PortInfo> {
    let mut ports = if cfg!(target_os = "windows") {
        parse_windows_ports()
    } else {
        parse_unix_ports()
    };

    // Enrich with process info
    let mut sys = System::new();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    for port in &mut ports {
        if port.pid > 0 {
            if let Some(process) = sys.process(Pid::from_u32(port.pid)) {
                port.process_name = process.name().to_string_lossy().to_string();
                let cmd_parts: Vec<String> = process.cmd().iter().map(|s| s.to_string_lossy().to_string()).collect();
                port.command = cmd_parts.join(" ");
            }
        }
    }

    ports.sort_by_key(|p| p.port);
    ports.dedup_by(|a, b| a.port == b.port && a.protocol == b.protocol);
    ports
}

fn parse_unix_ports() -> Vec<PortInfo> {
    let mut ports = Vec::new();

    let output = Command::new("lsof")
        .args(["-iTCP", "-sTCP:LISTEN", "-nP", "-F", "pcn"])
        .output();

    if let Ok(output) = output {
        let text = String::from_utf8_lossy(&output.stdout);
        let mut current_pid: u32 = 0;
        let mut current_name = String::new();

        for line in text.lines() {
            if let Some(pid_str) = line.strip_prefix('p') {
                current_pid = pid_str.parse().unwrap_or(0);
                current_name.clear();
            } else if let Some(name) = line.strip_prefix('c') {
                current_name = name.to_string();
            } else if let Some(name_field) = line.strip_prefix('n') {
                if let Some(colon_pos) = name_field.rfind(':') {
                    let addr = &name_field[..colon_pos];
                    let port_str = &name_field[colon_pos + 1..];
                    if let Ok(port) = port_str.parse::<u16>() {
                        ports.push(PortInfo {
                            port,
                            protocol: "TCP".to_string(),
                            pid: current_pid,
                            process_name: current_name.clone(),
                            command: String::new(),
                            address: addr.to_string(),
                        });
                    }
                }
            }
        }
    }

    ports
}

fn parse_windows_ports() -> Vec<PortInfo> {
    let mut ports = Vec::new();

    let output = Command::new("netstat")
        .args(["-ano"])
        .output();

    if let Ok(output) = output {
        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 5 && parts[3] == "LISTENING" {
                if let Some(colon_pos) = parts[1].rfind(':') {
                    let addr = &parts[1][..colon_pos];
                    let port_str = &parts[1][colon_pos + 1..];
                    if let Ok(port) = port_str.parse::<u16>() {
                        let pid: u32 = parts[4].parse().unwrap_or(0);
                        ports.push(PortInfo {
                            port,
                            protocol: parts[0].to_string(),
                            pid,
                            process_name: String::new(),
                            command: String::new(),
                            address: addr.to_string(),
                        });
                    }
                }
            }
        }
    }

    ports
}

#[tauri::command]
fn list_ports() -> Vec<PortInfo> {
    get_listening_ports()
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<String, String> {
    let mut sys = System::new();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    if let Some(process) = sys.process(Pid::from_u32(pid)) {
        let name = process.name().to_string_lossy().to_string();
        process.kill();
        Ok(format!("Killed {} (PID: {})", name, pid))
    } else {
        Err(format!("Process with PID {} not found", pid))
    }
}

#[tauri::command]
fn get_system_locale() -> String {
    let locale = sys_locale::get_locale().unwrap_or_else(|| "en".to_string());
    if locale.contains("zh") {
        "zh-CN".to_string()
    } else {
        "en".to_string()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            list_ports,
            kill_process,
            get_system_locale,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

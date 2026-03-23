import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import en from "./locales/en.json";
import zhCN from "./locales/zh-CN.json";

async function getDefaultLanguage(): Promise<string> {
  const saved = localStorage.getItem("portman-language");
  if (saved) return saved;
  try {
    return await invoke<string>("get_system_locale");
  } catch {
    return "en";
  }
}

const initI18n = async () => {
  const lng = await getDefaultLanguage();
  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      "zh-CN": { translation: zhCN },
    },
    lng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
  return i18n;
};

export default initI18n;

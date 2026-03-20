import enUS from '@/locales/en-US';
import zhCN from '@/locales/zh-CN';
import { getLocale } from 'umi';

type MessageValues = Record<string, string | number | boolean | null | undefined>;

const messageBundles: Record<string, Record<string, string>> = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

const interpolationPattern = /\{(\w+)\}/g;

const resolveLocale = () => {
  try {
    return getLocale?.() ?? 'en-US';
  } catch {
    return 'en-US';
  }
};

export const formatRuntimeMessage = (id: string, defaultMessage: string, values?: MessageValues) => {
  const locale = resolveLocale();
  const template = messageBundles[locale]?.[id] ?? defaultMessage;

  return template.replace(interpolationPattern, (_, key: string) => {
    const value = values?.[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
};

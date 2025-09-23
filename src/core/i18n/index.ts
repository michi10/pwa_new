import messages from './de-AT.json';

export type MessageKey = keyof typeof messages;

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template = messages[key];
  if (!template) {
    return key;
  }
  if (!params) {
    return template;
  }
  return template.replace(/\{(.*?)\}/g, (_, token: string) => {
    const value = params[token.trim()];
    return value !== undefined ? String(value) : '';
  });
}

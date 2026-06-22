export interface Language {
  code: string;
  label: string;
  nativeLabel: string;
  bcp47: string;
}

export const LANGUAGES: Language[] = [
  { code: "fr", label: "Français", nativeLabel: "Français", bcp47: "fr" },
  { code: "fon", label: "Fon", nativeLabel: "Fɔ̀ngbè", bcp47: "fon" },
  { code: "yo", label: "Yoruba", nativeLabel: "Yorùbá", bcp47: "yo" },
  { code: "wo", label: "Wolof", nativeLabel: "Wolof", bcp47: "wo" },
  { code: "ha", label: "Haoussa", nativeLabel: "Hausa", bcp47: "ha" },
  { code: "ig", label: "Igbo", nativeLabel: "Igbo", bcp47: "ig" },
  { code: "ln", label: "Lingala", nativeLabel: "Lingála", bcp47: "ln" },
  { code: "bm", label: "Bambara", nativeLabel: "Bamanankan", bcp47: "bm" },
  { code: "ff", label: "Peul", nativeLabel: "Fulfulde / Pulaar", bcp47: "ff" },
  { code: "dyu", label: "Dioula", nativeLabel: "Julakan", bcp47: "dyu" },
  { code: "sef", label: "Sénoufo", nativeLabel: "Sēnufo", bcp47: "sef" },
  { code: "dje", label: "Djerma", nativeLabel: "Zarma", bcp47: "dje" },
];

export const DEFAULT_LANGUAGE_CODE = "fr";

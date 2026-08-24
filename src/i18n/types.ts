export interface TrigramCell {
  pinyin: string;
  direction: string;
  lines?: number[];
  hanzi?: string;
}

export interface PartnerEntry {
  key: string;
  name: string;
  role: string;
  text?: string;
  imageAlt?: string;
  linkHref?: string;
  linkLabel?: string;
  linkInText?: string;
  textBefore?: string;
  textAfter?: string;
}

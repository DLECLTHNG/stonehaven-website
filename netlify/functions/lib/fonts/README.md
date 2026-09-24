# Embedded application font

`NotoSans.ttf` is the unmodified Noto Sans variable font from Google Fonts:

https://github.com/google/fonts/blob/main/ofl/notosans/NotoSans%5Bwdth%2Cwght%5D.ttf

Retrieved September 22, 2026. SHA-256:
`bfb7bb691513f12e734dc346c03a03f784912432d7e3fa8e56efcf906fe86b3d`.

Copyright 2022 The Noto Project Authors. The adjacent `OFL.txt` contains the SIL Open Font License 1.1 supplied with the font. Keep this license with the deployed font.

This font supports Latin, Greek and Cyrillic scripts, including many accented names. It does not cover every writing system. The PDF renderer checks each submitted name and address character against the embedded font before producing a document. It returns `PDF_UNSUPPORTED_CHARACTER` with the field and applicant index if a glyph is missing, instead of silently removing, transliterating or substituting the submitted name.

The Netlify function bundle must include `netlify/functions/lib/fonts/**`. The renderer uses its module-relative font path locally and the included-files path from the function working directory after bundling.

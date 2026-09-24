# HELOC subject property and income update

- Added a required subject property address, independent of each applicant's current home address, for single and joint applications.
- Updated the income label and guidance to include W2 and self-employment income before taxes. The internal `w2_income` field key remains stable for compatibility.
- Subject property is included in review, server validation, request fingerprinting and the encrypted PDF, on a separate property page. It is cleared with other sensitive form data after submission and page navigation.
- Verified 181 tests, content linters and site SEO checks. Added regression coverage for missing/invalid property data, PDF delivery, and changed-property retry rejection.
- Independently decrypted the synthetic PDF and checked all applicant/property fields. Visually reviewed all three joint PDF pages.
- Isolated browser checks passed at 390px and 1440px, including distinct current/subject addresses, required-property validation, joint review/edit, mocked submission and post-submit clearing. No production application or email was sent.

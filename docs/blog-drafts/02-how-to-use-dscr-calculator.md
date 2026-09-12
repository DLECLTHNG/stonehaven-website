---
status: DRAFT, not published
slug: how-to-use-dscr-calculator
h1: How to use a DSCR calculator: rent, payments, and loan sizing
seo_title: How to Use a DSCR Calculator | Stonehaven Lending
meta_description: A field-by-field walkthrough of Stonehaven's two DSCR calculators, what each input means, where to find it, and how to read the result.
eyebrow: DSCR · Calculator
primary_query: how to use a dscr calculator
related_questions: what is PITIA, monthly vs annual expenses on a DSCR calculator, what DSCR do I need, qualifying rent vs actual rent
geography: none (national)
category: DSCR
excerpt: Stonehaven runs two public DSCR calculators. One applies program rules to your rent, the other sizes a loan against a target ratio. Here is what every field means and how to read the output.
image_brief: Flat overhead photograph of a desk with a laptop showing a spreadsheet, a printed lease, and a property tax notice. Neutral daylight, no faces, no branding.
image_alt: A laptop, a lease, and a property tax statement on a desk, the three sources of DSCR calculator inputs
internal_links:
  - /dscr-program-calculator (DSCR Program Calculator)
  - /dscr-analyzer (DSCR loan calculator)
  - /calculation-methodology (how these figures are calculated)
  - /blog/dscr-program-calculator-qualifying-rent (qualifying rent rules)
  - /blog/dscr-loan-down-payment-ltv (how LTV changes the ratio)
  - /blog/dscr-too-low-restructure (what to do with a short ratio)
  - /dscr (DSCR loans for rental property)
  - /dscr-review (deal review)
---

# How to use a DSCR calculator: rent, payments, and loan sizing

**Short answer:** a DSCR calculator divides the rent a lender will actually count by the
full monthly housing payment on the loan you are asking for. Stonehaven publishes two of
them. The [DSCR Program Calculator](/dscr-program-calculator) applies program rules to
your rent unit by unit and returns the ratio for a loan amount you specify. The
[DSCR loan calculator](/dscr-analyzer) works the other direction and sizes a loan against
a target ratio. Neither is an approval. Both are the arithmetic a broker runs before
anything else happens.

The rest of this article walks every field on both tools, says where to find the number,
and explains how to read the result.

## The formula both tools use

For one-to-four unit rentals, the convention is:

> qualifying monthly rent ÷ monthly PITIA = DSCR

PITIA is principal, interest, taxes, insurance, and association dues. The critical rule is
that the numerator and the denominator must cover the same period. A monthly rent figure
divided by an annual payment figure produces a number that means nothing. Both Stonehaven
tools handle the conversion internally, but they ask for expenses differently, which is the
single most common source of a wrong answer. More on that below.

## Walking the DSCR Program Calculator

This is the tool to use when you know the loan amount you want and you need the ratio a
program would actually compute.

### Property type

Four choices: **1–4 unit rental**, **Short-term rental**, **Condotel**, and **5–8 units**.
This is not cosmetic. Each one changes how your rent is treated. A condotel takes an 80
percent haircut on both purchase and refinance. A short-term rental is qualified on market
rent on a purchase. The unit schedule below expands to 1 through 4 units for the first
three types and 5 through 8 for the last.

### Transaction

**Purchase** or **Refinance**. Several rules only exist on one side. The 115 percent
allowance for a lease above market applies on refinances, not purchases. Vacant units are
not permitted on a one-to-four unit refinance at all. The rule set is covered in detail in
[which rent a DSCR program actually counts](/blog/dscr-program-calculator-qualifying-rent).

### Property value ($) and Loan amount ($)

Enter the value the lender is likely to accept, not your optimistic number. On a purchase
that is generally the lower of the contract price and the appraised value, subject to
program rules. On a refinance it is the appraised value, and programs commonly apply a
seasoning rule that can force a recently purchased property to be valued at cost for a
period.

Loan amount is what you are requesting. The tool divides the two and displays **LTV**. It
does not cap the loan for you, so an LTV above what a program allows will still compute a
ratio. Treat the LTV output as information, not permission.

### Interest rate (%)

Your own rate estimate. The calculator has no rate sheet inside it and does not quote
pricing. If you do not have a quote, use a figure you can defend and change it to see how
sensitive the deal is. Every number in this article uses **7.25 percent as an illustrative
rate only**. It is not a quote, not an offer, and not a rate available to anyone.

### Amortization

Six options: 30-yr fixed, 5/6 ARM, 30-yr fixed with 10-yr IO, 5/6 ARM with 10-yr IO on a
30-year basis, the same on a 40-year basis, and 40-yr fixed with 10-yr IO. The two
amortizing options qualify on a 30-year payment. Every 10-year interest-only option
qualifies on the interest-only payment, which is the balance times the rate divided by 12.
That is why switching to interest-only can lift a ratio without changing the rent.

### First-time investor?

Yes or No. In the rules this calculator models, a first-time investor case needs a ratio of
at least 1.00, and no-ratio treatment is not available. Whether a given lender agrees is a
question for the lender.

### Unit schedule

Set **Number of units**, then fill each row. Depending on the property type and transaction
you will see **Market rent**, **Current rent**, **Rent receipt?**, **Vacant?**, and for
short-term rentals and condotels on a refinance, **12-mo STR history (mo. avg)**.

Where to find each one:

| Field | Where the number comes from |
|---|---|
| Market rent | The appraiser's comparable rent schedule, Form 1007 for a single unit or Form 1025 for two to four units. Before you have an appraisal, a defensible estimate from comparable listings. |
| Current rent | The signed, in-place lease. Not the asking rent and not a proposed lease. |
| Rent receipt? | Whether you can document that the tenant actually pays the lease amount, usually bank deposits or a rent ledger. |
| Vacant? | Whether the unit is unoccupied at application. |
| 12-mo STR history | The trailing twelve-month average from a third-party management platform or provider statement, not your own spreadsheet. |

### Monthly property expenses

Four fields, all monthly: **Hazard insurance ($/mo)**, **Real-estate taxes ($/mo)**,
**Common charges ($/mo)**, and **Ground rents ($/mo)**.

This is where most errors happen. The page notes that for a purchase in California or new
construction you can use 1.25 percent of the sale price divided by 12 as a tax placeholder.
Everywhere else, take the annual figure and divide by 12 before typing it.

### Reading the output

Six results, plus flags: **Your DSCR**, **Qualifying rent (monthly)**, **Qualifying
payment**, **Taxes · insurance · charges**, **Full monthly payment (PITIA)**, and **LTV**.
Compare **Qualifying rent** against the rent you expected. If it is lower, the program
discounted it and the reason is in the rules. Flags call out program limits such as vacant
units on a refinance or a loan below the minimum.

## Walking the DSCR loan calculator

The [DSCR loan calculator](/dscr-analyzer) answers the opposite question: what does the
rent support? Its inputs are **Purchase price ($)**, **Down payment (%)**, **Interest rate
est. (%)**, **Monthly rent ($)**, **Annual taxes ($)**, **Annual insurance ($)**, **HOA /
other, monthly ($)**, and **Target DSCR (for sizing)**.

Note the differences. This tool takes a down payment percentage rather than a loan amount,
and it takes **annual** taxes and insurance while the Program Calculator takes **monthly**.
Its sizing outputs are **Rent needed @ target**, **Max P&I @ target**, and **Illustrative
max loan @ target**. It runs on a 30-year amortization.

One caution on the max loan output. It is derived from the rent at your chosen ratio. It is
not the lesser of that figure and the program's LTV ceiling, and it does not know your
credit, reserves, or loan minimums. The loan you can actually get is the most restrictive
of all of those limits, never just the ratio-derived one.

## A hypothetical worked example

**Assumptions, all hypothetical:** a single rental unit, purchase, property value $320,000,
loan amount $240,000, illustrative rate 7.25 percent, 30-year fixed, market rent $2,400 a
month, hazard insurance $150 a month, real-estate taxes $310 a month, no common charges or
ground rents.

| Step | Figure |
|---|---|
| Qualifying rent | $2,400.00 |
| Qualifying payment (P&I) | $1,637.22 |
| Taxes · insurance · charges | $460.00 |
| Full monthly payment (PITIA) | $2,097.22 |
| DSCR ($2,400.00 ÷ $2,097.22) | 1.1444, displayed 1.14x |
| LTV ($240,000 ÷ $320,000) | 75% |

Now the error. Type the same taxes and insurance as annual figures, $3,720 and $1,800, into
the monthly fields. PITIA becomes $7,157.22 and the ratio collapses to 0.34x. Nothing about
the property changed. If your result looks absurd, check these two fields first.

The same property in the other tool takes $3,720 annual taxes, $1,800 annual insurance, and
a 25 percent down payment.

## What the result does not tell you

A ratio above 1.00 is a lender test, not an investment verdict. Rent minus PITIA is not
your cash flow. Vacancy, management, maintenance, capital reserves, and leasing costs all
come out of the same rent and none of them appear in the formula. The
[deal review](/dscr-review) models both views deliberately, because a property can pass the
lender's test and still be a poor hold.

These calculators also do not decide anything. Credit, reserves, property condition,
program eligibility, and the appraisal all sit outside the arithmetic. The methodology
behind the code is published at [how these figures are calculated](/calculation-methodology).

## Mistakes to watch for

- Annual taxes or insurance typed into the monthly fields, or the reverse.
- Using asking rent instead of the in-place lease, or a proposed lease instead of a signed one.
- Forgetting association dues, which belong in PITIA.
- Treating the illustrative max loan as an approval amount rather than one of several ceilings.
- Choosing interest-only for the ratio without pricing what happens when the interest-only period ends.
- Entering an optimistic value rather than one an appraisal is likely to support.

## FAQ

**What DSCR do I need?**
It depends on the program and the lender. The rules this calculator models set minimums
that differ by property type, and some programs lend below 1.00 at reduced leverage while
others do not. There is no single industry minimum.

**Is the calculator an approval?**
No. It is the same math the desk runs first. Lenders also weigh credit, reserves, and
property condition.

**Why is my qualifying rent lower than my actual rent?**
Programs discount rent by rule. Which rule applies depends on property type and whether you
are buying or refinancing. The
[qualifying rent article](/blog/dscr-program-calculator-qualifying-rent) works through each one.

**Which calculator should I use?**
Use the Program Calculator when you know the loan amount and the property is a short-term
rental, condotel, or five-to-eight unit building. Use the DSCR loan calculator when you
want to size a loan against a target ratio on a simple one-to-four unit rental.

**Does the rate I enter affect the result?**
Yes, substantially, because it drives the payment in the denominator. Use a figure you can
defend and test a range around it.

## Next step

Run the property through the [DSCR Program Calculator](/dscr-program-calculator), then send
us the purchase price or value, the rent, the loan amount you want, and your estimated
taxes and insurance so we can review the structure. A [deal review](/dscr-review) comes back
from a specialist, and there is no credit pull at that stage.

---

*Stonehaven Lending is a mortgage brokerage, not a direct lender. Financing is arranged
through third-party capital providers and is subject to lender underwriting, documentation,
valuation, program availability, and applicable licensing. Calculator results and the
examples above are educational estimates, not an approval, commitment, rate quote, or
guarantee. The 7.25 percent rate used in the example is illustrative only and is not an
offer. Program availability varies by state. Equal Housing Opportunity. NMLS #1752355.*

---

## EDITOR NOTES (not for publication)

- Every figure computed against js/dscr-programs.js on 2026-09-11 and cross-checked with an
  independent amortization function. P&I on $240,000 at 7.25% over 360 months = $1,637.22.
- All field labels transcribed from the live pages, verified 2026-09-11. If the calculator
  UI changes, this article needs a pass.
- The California and new-construction tax placeholder is quoted from the calculator page's
  own helper text.
- Requires a Spanish mirror before publication.

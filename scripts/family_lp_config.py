# -*- coding: utf-8 -*-
"""Family Opportunity Mortgage landing pages: THE ONE PLACE TO EDIT.

Contact details, branding, service states, legal disclosures, privacy URL,
form destination, tracking switches and every line of page copy live here.
Then run:  python3 scripts/build-family-lps.py
which regenerates:
  buy-a-home-for-parents.html, family-housing-options.html, request-received.html,
  js/family-config.js (runtime copy of the non-copy settings) and
  netlify/functions/family-shared.json (server-side allowlists).

Rules baked into the generator: no em dashes, no trailing periods on headings,
no numeric mortgage terms, no ad tags on the adult-child page or the
confirmation page (hard-coded in js/family-lp.js, not a switch)."""

SITE_URL = "https://stonehavencre.com"

BRAND = dict(
    name="Stonehaven Lending",
    entity_note="Stonehaven Lending",          # legal entity attribution: CONFIRM before launch
    tagline="Mortgage brokerage",
    mark="/assets/mark.png",                  # existing approved brand mark (76px sitewide)
    og_image="/assets/og-logo.png",
    nmls_id="1752355",
    nmls_consumer_access="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1752355",
)

CONTACT = dict(
    person="Chris De Leeuw",
    title="Co-Founder, Stonehaven Lending",
    phone_e164="+14709704979",
    phone_display="(470) 970-4979",
    email="chris@stonehavencre.com",
    address="10 Roswell Street, Suite 102, Alpharetta, GA 30009",
    headshot="",   # "" = hidden. Set only to a verified photo of Chris, e.g. "/assets/chris-de-leeuw.jpg"
)

PRIVACY_URL = "/privacy"
FANNIE_OCCUPANCY_URL = "https://selling-guide.fanniemae.com/sel/b2-1.1-01/occupancy-types"

# Residential service states as listed on the current website. Program
# availability for this financing must be confirmed per state before launch.
SERVICE_STATES = [("GA", "Georgia"), ("AL", "Alabama"), ("TN", "Tennessee"),
                  ("FL", "Florida"), ("NC", "North Carolina"), ("SC", "South Carolina")]

LICENSING_LINE = ("Residential mortgage programs are offered in Georgia (Residential Mortgage Licensee #19721), "
                  "Alabama (#22874), Tennessee (#165060), Florida (#MBR3925), North Carolina (#B-198926), "
                  "and South Carolina.")

FOOTER_DISCLOSURE = ("Stonehaven Lending is a mortgage brokerage, not a direct lender. Financing is arranged through "
                     "third-party lenders and is subject to underwriting, documentation, program availability, and "
                     "applicable licensing. This information is not a commitment to lend or a guarantee of any rate "
                     "or term. Program availability varies by state.")

# Version stamp stored with every inquiry so the record shows which notice the
# visitor saw. Bump when the notice wording changes.
CONSENT_NOTICE_VERSION = "fo-notice-2026-09-11"
CONSENT_NOTICE = ("By selecting Request a Call, you ask Stonehaven Lending to contact you about this inquiry at the "
                  "phone number provided, and by email if supplied. This is an inquiry, not a mortgage application.")

FORM = dict(
    endpoint="/.netlify/functions/family-inquiry",   # server function: validates, rate-limits, persists, returns inquiry id
    heading="Let's talk through the options",
    intro="Tell us where you are looking and how to reach you.",
    button="Request a Call",
    timing_label="Purchase timing (optional)",
    timing_options=[("exploring", "Exploring"), ("within_3_months", "Within 3 months"),
                    ("3_to_6_months", "3 to 6 months"), ("more_than_6_months", "More than 6 months")],
)

# All measurement is OFF by default. Meta Pixel / CAPI / retargeting can never
# load on the adult-child page or on /request-received (enforced in code).
TRACKING = dict(
    ga4_id="",                 # e.g. "G-XXXXXXX". Aggregate page views + form starts + inquiry success on the parents page only.
    ga4_on_sensitive_page=False,  # keep False: no analytics on the adult-child page unless separately reviewed
    meta_pixel_id="4039555362846500",  # parents page only, same Pixel as the rest of the site (set 2026-07-31). Lead fires after a confirmed server success, never on click or confirmation visit.
    capi=False,                # server-side relay for the parents page only. Requires META_CAPI_TOKEN in Netlify and a review.
)

INDEXABLE = False   # draft previews stay noindex; flip to True at launch (confirmation page stays noindex regardless)

SHARED = dict(
    eyebrow="Family Opportunity Mortgage",
    cta="Request a Call",
    how_link="How it works",
    person_h="A real person on the other end",
    person_p=("Questions about the family-occupancy approach go to a co-founder, not a call center. "
              "Call, email, or request a call and the follow-up comes from Stonehaven directly."),
    closing_note="A mortgage application and any credit authorization are separate steps that come later, only if you choose to proceed.",
    illustration_note="Illustration for context only. Not a client story.",
)

PAGES = [
dict(
    slug="buy-a-home-for-parents", page_id="family-parents", sensitive=False,
    title="Buy a Home for Your Parents, Keep Your Own | Stonehaven Lending",
    description=("Conventional family-occupancy guidelines may let you finance a home your parents live in using "
                 "primary-residence terms while you live elsewhere. Request a call from Stonehaven Lending."),
    h1="Buy a home for your parents. Keep your own home.",
    sub=("Certain conventional mortgage guidelines may let you finance a home for your parents using primary-residence "
         "terms, even when you live elsewhere. Stonehaven can help you explore whether this approach fits."),
    micro="Start with a conversation. This form does not authorize a credit check.",
    points=["Your parents live in the home.", "You apply for the financing.", "You may be able to keep your current home."],
    photo="",   # "" = no photo. Licensed or supplied asset only: adults of different generations together at home.
    photo_alt="Adults of different generations together in a family home",
    story_h="A home that fits the next chapter",
    story_p=("A move closer to family, a more manageable home, or a place with fewer stairs can start with a financing "
             "question. Before deciding how to buy, it helps to understand which mortgage structure fits the people "
             "who will live there."),
    how_h="How this financing works",
    steps=[("Start with the family housing plan", "Tell Stonehaven where you are looking and when you hope to buy."),
           ("Review the mortgage options", "We discuss the occupancy rules, your borrowing profile, and which lender options may fit."),
           ("Decide on the next step", "If it makes sense to proceed, we explain the application, documentation, and lender review process.")],
    explainer_h="Why the occupancy rules matter",
    explainer_p=("Family Opportunity Mortgage is a common name for a conventional financing approach. In qualifying "
                 "situations, a home occupied by a parent can receive primary-residence treatment even when the adult "
                 "child borrowing the money lives elsewhere. It is not a grant or a separate government benefit."),
    explainer_link_text="Read the occupancy guidance",
    work_h="What we will work through together",
    work_items=["The parent's intended primary residence",
                "The applicable family-occupancy requirements",
                "The buyer's income, credit, assets, and existing obligations",
                "The down payment, closing costs, and complete housing payment"],
    work_note=("Fannie Mae's parent provision applies when the parent cannot work or lacks enough income to qualify "
               "independently. Other investor and lender requirements can differ. Stonehaven will review the "
               "applicable route for the scenario."),
    faqs=[("Do I have to live with my parents?", "An eligible family-occupancy arrangement can allow you to live elsewhere while the home is your parents' primary residence."),
          ("Can I already own a home?", "Yes, that can be possible. Existing housing costs and other obligations still matter when the lender reviews the new loan."),
          ("Do my parents need to borrow with me?", "The family-occupancy approach may allow you to borrow without your parents being co-borrowers. Stonehaven will review the appropriate loan and ownership structure."),
          ("How much would I need upfront?", "Your required down payment, closing costs, and any reserves depend on the loan and lender. We will help you understand the amounts for your situation."),
          ("Is this for a vacation home or rental?", "This page addresses a home occupied by your parents as their primary residence. Other uses need a different review."),
          ("Am I applying for a mortgage here?", "No. You are asking Stonehaven to contact you. A mortgage application and any credit authorization are separate steps.")],
    closing_h="Let's talk through a home for your parents",
    closing_p="Tell us where you are looking and how to reach you. A Stonehaven team member will follow up to discuss the options and next steps.",
),
dict(
    slug="family-housing-options", page_id="family-adult-child", sensitive=True,
    title="A Home for an Adult Child with a Disability | Stonehaven Lending",
    description=("Parents or legal guardians may be able to finance a separate home for an adult child with a "
                 "disability under conventional family-occupancy guidelines. Request a call from Stonehaven Lending."),
    h1="A home of their own. A plan you can build together.",
    sub=("Explore a conventional mortgage option for parents or legal guardians buying a home for an adult child with a "
         "disability. Eligible arrangements may receive primary-residence terms even when the borrower lives elsewhere."),
    micro="Start with a conversation. No medical information is needed in this form.",
    points=["Explore a separate home for an adult child.", "Understand the financing responsibilities.", "Plan around the household's needs and preferences."],
    photo="",   # "" = no photo. Licensed or supplied asset only: an adult with agency in an ordinary home. No medical props.
    photo_alt="An adult at home in an ordinary living space",
    story_h="Start with the home and the person who will live there",
    story_p=("Location, accessibility, everyday routines, and nearby support can all shape the housing decision. "
             "Stonehaven can help explain the mortgage side while the family and its advisers consider the broader plan."),
    how_h="How this financing works",
    steps=[("Describe the housing goal", "Share the purchase state, timing, and how to contact you. Keep medical and benefits information out of the inquiry form."),
           ("Understand the financing route", "Stonehaven explains the family-occupancy approach and what a lender would need to review through the appropriate application process."),
           ("Coordinate the next steps", "Review affordability and ownership alongside any care, benefits, or estate-planning advice the family needs.")],
    explainer_h="Who this option may fit",
    explainer_p=("Under Fannie Mae's provision, a parent or legal guardian may receive owner-occupant treatment when "
                 "purchasing housing for an adult child with a disability who cannot work or lacks enough income to "
                 "qualify independently. The applicable lender must confirm eligibility and documentation. Disability "
                 "alone does not guarantee approval."),
    explainer_small="This financing discussion concerns housing. It does not determine the support services or living arrangement that is appropriate for an individual.",
    explainer_link_text="Read the occupancy guidance",
    work_h="Include the whole plan",
    work_items=[("Mortgage affordability", "Consider existing obligations, the new payment, taxes, insurance, maintenance, and any separately arranged support costs."),
                ("Ownership", "Discuss title and longer-term arrangements with the appropriate legal adviser."),
                ("Benefits", "Housing support can affect means-tested benefits such as SSI. Review the proposed arrangement with a qualified benefits adviser before deciding on a structure.")],
    work_note="",
    faqs=[("Does my adult child have to qualify for the mortgage?", "This approach can allow the parent or legal guardian to be the qualifying borrower, subject to the lender's review."),
          ("Does my adult child need to be unable to work?", "Fannie Mae describes two alternatives: inability to work, or insufficient income to qualify independently. The adult child must meet the disability-related provision, and the lender determines the documentation needed."),
          ("Do I have to live in the home?", "An eligible arrangement can allow the borrower to live elsewhere while the adult child occupies the home as their primary residence."),
          ("Will this protect SSI or other benefits?", "Mortgage eligibility does not establish benefits eligibility. Housing support and ownership arrangements may affect benefits and need a separate review."),
          ("Should I send medical records?", "No. Do not send medical records, diagnoses, Social Security numbers, or benefits documents through this page."),
          ("What happens after I submit?", "Stonehaven will contact you to discuss the housing goal and explain potential next steps. Submitting does not approve a loan or authorize a credit check.")],
    closing_h="Explore the financing side of the housing plan",
    closing_p="Start with a few contact details. We will follow up for a conversation about the options and next steps.",
),
]

CONFIRMATION = dict(
    slug="request-received",
    title="Request Received | Stonehaven Lending",
    h1="Thank you. Your request has been received.",
    body=("A Stonehaven team member will contact you to discuss your inquiry. You can also call %s. "
          "This request does not approve financing or authorize a credit check."),
    reference_label="Your reference",
    correction="Need to correct a detail? Email",
)

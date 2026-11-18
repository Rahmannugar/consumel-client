# Recurring allowance screenshots

Version 2 shows custom UTC intervals in the real customer balance workflow.
The cropped Light Mode PNGs exclude browser chrome, private context, and
developer controls. `recurring-allowance-fixture-v2.json` records the disposable
Sandbox state used for the captures: an active six-hour allowance with a
30-minute change scheduled for the next renewal. Version 1 records the earlier
monthly-only interface.

To refresh the current assets, create a disposable local organization, project
with Sandbox and Live, customer, and prepaid `api_calls` meter. Use the real
allowance form to grant 500 units every six hours, starting at 00:15 UTC on the
capture date, with a 1,000-unit rollover cap. Schedule a change to every 30
minutes. Capture the recurring-allowance section and edit dialog in Light Mode.
Keep the dates, fixture description, and screenshot version synchronized. Do
not seed screenshot data into production or an organization's real Sandbox.

When `consumel-docs` is built, publish optimized copies beside the allowance
guide and synchronize them from these client-owned source assets.

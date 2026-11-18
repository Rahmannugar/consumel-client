# Recurring allowance screenshots

The versioned PNGs show the real customer balance workflow in Light Mode,
without browser chrome, private account context, or developer controls.
`recurring-allowance-fixture-v1.json` records the disposable Sandbox state used
for the captures. The allowance integration tests exercise the same prior-period
and renewal setup; no screenshot state is hard-coded in the application.

To refresh these assets, create a disposable local organization, project with
Sandbox and Live, customer, and prepaid `api_calls` meter. Establish the fixture
periods in the local database, run the normal allowance worker to renew the
current period, and use the real public API to schedule the next revision.
Sign into the disposable organization, open the customer's balance detail,
and capture the recurring-allowance section and edit dialog in Light Mode.
Keep the UI, period dates, and fixture description synchronized when recapturing;
do not seed this fixture into production or an organization's real Sandbox.

When `consumel-docs` is built, publish optimized copies beside the allowance
guide and synchronize them from these client-owned source assets.

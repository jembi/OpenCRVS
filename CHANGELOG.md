# Changelog

## 1.7.1 Release candidate

### Breaking changes

### New features

### Improvements

### Deprecated

### Bug fixes

- Fix the "email all users" feature by setting the _To_ email to the logged user's email [#8343](https://github.com/opencrvs/opencrvs-core/issues/8343)

## 1.7.0 Release candidate

### Breaking changes

- **Dashboard:** Changes made to the dashboard configuration will reset after upgrading OpenCRVS.
- Removed unused searchBirthRegistrations and searchDeathRegistrations queries, as they are no longer used by the client.
- **Retrieve action deprecated:** Field agents & registration agents used to be able to retrieve records to view the audit history & PII. We are removing this in favor of audit capabilities that is planned for in a future release.
- **Github runners upgraded** to lastest Ubuntu LTS release 24.04 [#7045](https://github.com/opencrvs/opencrvs-core/issues/7045)

### New features

- Allow configuring the default search criteria for record search [#6924](https://github.com/opencrvs/opencrvs-core/issues/6924)
- Add checks to validate client and server are always on the same version. This prevents browsers with a cached or outdated client versions from making potentially invalid requests to the backend [#6695](https://github.com/opencrvs/opencrvs-core/issues/6695)
- Two new statuses of record are added: `Validated` and `Correction Requested` for advanced search parameters [#6365](https://github.com/opencrvs/opencrvs-core/issues/6365)
- A new field: `Time Period` is added to advanced search [#6365](https://github.com/opencrvs/opencrvs-core/issues/6365)
- Deploy UI-Kit Storybook to [opencrvs.pages.dev](https://opencrvs.pages.dev) to allow extending OpenCRVS using the component library
- Record audit action buttons are moved into action menu [#7390](https://github.com/opencrvs/opencrvs-core/issues/7390)
- Reoder the sytem user add/edit field for surname to be first, also change labels from `Last name` to `User's surname` and lastly remove the NID question from the form [#6830](https://github.com/opencrvs/opencrvs-core/issues/6830)
- Corrected the total amount displayed for _certification_ and _correction_ fees on the Performance Page, ensuring accurate fee tracking across certification and correction sequences. [#7793](https://github.com/opencrvs/opencrvs-core/issues/7793)
- Auth now allows registrar's token to be exchanged for a new token that strictly allows confirming or rejecting a specific record. Core now passes this token to country configuration instead of the registrar's token [#7728](https://github.com/opencrvs/opencrvs-core/issues/7728) [#7849](https://github.com/opencrvs/opencrvs-core/issues/7849)
- **Template Selection for Certified Copies**: Added support for multiple certificate templates for each event (birth, death, marriage). Users can now select a template during the certificate issuance process.
- **Template-based Payment Configuration**: Implemented payment differentiation based on the selected certificate template, ensuring the correct amount is charged.
- **Template Action Tracking**: Each template printed is tracked in the history table, showing which specific template was used.
- **Template Selection Dropdown**: Updated print workflow to include a dropdown menu for template selection when issuing a certificate.
- **QR code scanner**: A form field component allows pre-populating informant's details based on a ID card [#8196](https://github.com/opencrvs/opencrvs-core/pull/8196)
- Introduced a new customisable UI component: Banner [#8276](https://github.com/opencrvs/opencrvs-core/issues/8276)
- Auth now allows exchanging user's token for a new record-specific token [#7728](https://github.com/opencrvs/opencrvs-core/issues/7728)
- A new GraphQL mutation `upsertRegistrationIdentifier` is added to allow updating the patient identifiers of a registration record such as NID [#8034](https://github.com/opencrvs/opencrvs-core/pull/8034)
- A new GraphQL mutation `updateField` is added to allow updating any field in a record [#8291](https://github.com/opencrvs/opencrvs-core/pull/8291)
- Updated GraphQL mutation `confirmRegistration` to allow adding a `comment` for record audit [#8197](https://github.com/opencrvs/opencrvs-core/pull/8197)
- Allow countries to customise the format of the full name in the sytem for `sytem users` and `citizens` e.g `{LastName} {MiddleName} {Firstname}`, in any case where one of the name is not provided e.g no `MiddleName`, we'll simply render e.g `{LastName} {FirstName}` without any extra spaces if that's the order set in `country-config`. [#6830](https://github.com/opencrvs/opencrvs-core/issues/6830)

### Improvements

- Auth token, ip address, remote address redacted from server log
- **Align Patient data model with FHIR**: Previously we were using `string[]` for `Patient.name.family` field instead of `string` as mentioned in the FHIR standard. We've now aligned the field with the standard.
- **Certificate Fetching**: Removed certificates from the database, allowing them to be fetched directly from the country configuration via a simplified API endpoint.

### Deprecated

- `validator-api` & `age-verification-api` & `nationalId` scopes are deprecated as unused. Corresponding scopes are removed from the `systemScopes` and also removed from the audience when creating the token [#7904](https://github.com/opencrvs/opencrvs-core/issues/7904)

### Bug fixes

- Fix task history getting corrupted if a user views a record while it's in external validation [#8278](https://github.com/opencrvs/opencrvs-core/issues/8278)
- Fix health facilities missing from dropdown after correcting a record address [#7528](https://github.com/opencrvs/opencrvs-core/issues/7528)
- "Choose a new password" form now allows the user to submit the form using the "Enter/Return" key [#5502](https://github.com/opencrvs/opencrvs-core/issues/5502)
- Dropdown options now flow to multiple rows in forms [#7653](https://github.com/opencrvs/opencrvs-core/pull/7653)
- Only render units/postfix when field has a value [#7055](https://github.com/opencrvs/opencrvs-core/issues/7055)
- Only show items with values in review [#5192](https://github.com/opencrvs/opencrvs-core/pull/5192)
- Fix prefix text overlap issue in form text inputs
- Fix the informant column on the Perfomance page showing "Other family member" when `Someone else` is selected for a registration [#6157](https://github.com/opencrvs/opencrvs-core/issues/6157)
- Fix the event name displayed in email templates for death correction requests [#7703](https://github.com/opencrvs/opencrvs-core/issues/7703)

## 1.6.3 Release candidate

### Improvements

- For countries where local phone numbers start with 0, we now ensure the prefix remains unchanged when converting to and from the international format.

## 1.6.2 Release candidate

### Deprecated

- `INFORMANT_SIGNATURE` & `INFORMANT_SIGNATURE_REQUIRED` are now deprecated and part of form config

### Bug fixes

- Fix health facilities missing from dropdown after correcting a record address [#7528](https://github.com/opencrvs/opencrvs-core/issues/7528)
- Fix stale validations showing for document uploader with options form field

## [1.6.1](https://github.com/opencrvs/opencrvs-core/compare/v1.6.0...v1.6.1)

### Bug fixes

- Maximum upload file size limit is now based on the size of the uploaded files after compression and not before. [#7840](https://github.com/opencrvs/opencrvs-core/issues/7840)
- Stops local sys admins creating national level users. [#7698](https://github.com/opencrvs/opencrvs-core/issues/7698)

### New features

- Add an optional configurable field in section `canContinue` which takes an expression. Falsy value of this expression will disable the continue button in forms. This can be used to work with fetch field which has a loading state and prevent the user to get past the section while the request is still in progress.

## [1.6.0](https://github.com/opencrvs/opencrvs-core/compare/v1.5.1...v1.6.0)

### Breaking changes

- Remove informant notification configuration from the UI and read notification configuration settings from `record-notification` endpoint in countryconfig
- Remove DEL /elasticIndex endpoint due to reindexing changes.
- **Gateways searchEvents API updated** `operationHistories` only returns `operationType` & `operatedOn` due to the other fields being unused in OpenCRVS
- **Config changes to review/preview and signatures** Core used to provide review/preview section by default which are now removed and need to be provided from countryconfig. The signature field definitions (e.g. informant signature, bride signature etc.) were hard coded in core which also have now been removed. The signatures can now be added through the review/preview sections defined in countryconfig just like any other field. You can use the following section definition as the default which is without any additional fields. We highly recommend checking out our reference country repository which has the signature fields in its review/preview sections

```
{
  id: 'preview',
  viewType: 'preview',
  name: {
    defaultMessage: 'Preview',
    description: 'Form section name for Preview',
    id: 'register.form.section.preview.name'
  },
  title: {
    defaultMessage: 'Preview',
    description: 'Form section title for Preview',
    id: 'register.form.section.preview.title'
  },
  groups: [
    {
      id: 'preview-view-group',
      fields: []
    }
  ]
}
```

- `hasChildLocation` query has been removed from gateway. We have created the query `isLeafLevelLocation` instead which is more descriptive on its intended use.

### New features

- **Conditional filtering for document select options** The select options for the DOCUMENT_UPLOADER_WITH_OPTION field can now be conditionally filtered similar to the SELECT_WITH_OPTIONS field using the `optionCondition` field
- Supporting document fields can now be made required
- If there is only one option in the document uploader select, then it stays hidden and only the upload button is showed with the only option being selected by default
- A new certificate handlebar "preview" has been added which can be used to conditionally render some svg element when previewing the certificate e.g. background image similar to security paper
- Add HTTP request creation ability to the form with a set of new form components (HTTP, BUTTON, REDIRECT) [#7489](https://github.com/opencrvs/opencrvs-core/issues/7489)

### Improvements

- **ElasticSearch reindexing** Allows reindexing ElasticSearch via a new search-service endpoint `reindex`. We're replacing the original `ocrvs` index with timestamped ones. This is done automatically when upgrading and migrating, but this is an important architectural change that should be noted. More details in [#7033](https://github.com/opencrvs/opencrvs-core/pull/7033).
- Internally we were storing the `family` name field as a required property which was limiting what how you could capture the name of a person in the forms. Now we are storing it as an optional property which would make more flexible.
- Remove the leftover features from the application config pages, such as certificates and informant notification. [#7156](https://github.com/opencrvs/opencrvs-core/issues/7156)
- **PDF page size** The generated PDF used to be defaulted to A4 size. Now it respects the SVG dimensions if specified
- Support html content wrapped in `foreignObject` used in svg template in certificate PDF output

### Bug fixes

- Custom form field validators from country config will work offline. [#7478](https://github.com/opencrvs/opencrvs-core/issues/7478)
- Registrar had to retry from outbox every time they corrected a record. [#7583](https://github.com/opencrvs/opencrvs-core/issues/7583)
- Local environment setup command (`bash setup.sh`) could fail in machines that didn't have a unrelated `compose` binary. Fixed to check for Docker Compose. [#7609](https://github.com/opencrvs/opencrvs-core/pull/7609)
- Fix wrong status shown in the Comparison View page of the duplicate record [#7439](https://github.com/opencrvs/opencrvs-core/issues/7439)
- Fix date validation not working correctly in Firefox [#7615](https://github.com/opencrvs/opencrvs-core/issues/7615)
- Fix layout issue that was causing the edit button on the AdvancedSearch's date range picker to not show on mobile view. [#7417](https://github.com/opencrvs/opencrvs-core/issues/7417)
- Fix hardcoded placeholder copy of input when saving a query in advanced search
- Handle label params used in form inputs when rendering in action details modal
- **Staged files getting reset on precommit hook failure** We were running lint-staged separately on each package using lerna which potentially created a race condition causing staged changes to get lost on failure. Now we are running lint-staged directly without depending on lerna. **_This is purely a DX improvement without affecting any functionality of the system_**
- Fix `informantType` missing in template object which prevented rendering informant relationship data in the certificates [#5952](https://github.com/opencrvs/opencrvs-core/issues/5952)
- Fix users hitting rate limit when multiple users authenticated the same time with different usernames [#7728](https://github.com/opencrvs/opencrvs-core/issues/7728)
- "Choose a new password" form now allows the user to submit the form using the "Enter/Return" key [#5502](https://github.com/opencrvs/opencrvs-core/issues/5502)
- Dropdown options now flow to multiple rows in forms [#7653](https://github.com/opencrvs/opencrvs-core/pull/7653)
- Only render units/postfix when field has a value [#7055](https://github.com/opencrvs/opencrvs-core/issues/7055)
- Only show items with values in review [#5192](https://github.com/opencrvs/opencrvs-core/pull/5192)
- Fix prefix text overlap issue in form text inputs

## 1.5.1

### Improvements

- Fetch child identifier in view record
- Home screen application’s name and icons are to be configured from country configuration package as manifest.json and app icon files are moved from core to country config (check `opencrvs-countryconfig/src/client-static` folder)

### Bug fixes

- On slow connections or in rare corner cases, it was possible that the same record got saved to the database twice. This was caused by a bug in how the unique technical identifier we generate were stored as FHIR. The backend now ensures every record is submitted only once. [#7477](https://github.com/opencrvs/opencrvs-core/issues/7477)
- Fixed an issue where address line fields (e.g., address line 1, address line 2, etc.) were not being updated correctly when a user attempted to update a record's event location, such as place of birth or place of death. [#7531](https://github.com/opencrvs/opencrvs-core/issues/7531)
- Handle label params used in form inputs when rendering in review section view
- Fix probable migration issues for countries migrating from 1.2 [#7464](https://github.com/opencrvs/opencrvs-core/issues/7464)
- When a declaration(birth/death) is created the event location information was not being parsed to ElasticSearch which caused the Advanced search feature to not work when searching for records by event location.[7494](https://github.com/opencrvs/opencrvs-core/issues/7494)
- When any user's role was updated, incorrect role was shown for that user's actions in the history section of a declaration's record audit page. [#7495](https://github.com/opencrvs/opencrvs-core/issues/7495)
- Registration agent was unable to download declarations that were previously corrected by registrar. [#7582](https://github.com/opencrvs/opencrvs-core/issues/7582)
- When a user updates a marriage declaration editing the signature of the bride, groom, witness one or witness two, handle the changed value of the signature properly. [#7462](https://github.com/opencrvs/opencrvs-core/issues/7462)
- Registration agent was unable to download declarations that were previously corrected by registrar. [#7582](https://github.com/opencrvs/opencrvs-core/issues/7582)
- The internal function we used to check if all the location references listed in the encounter are included in the bundle had incorrect logic which resulted in location details missing in ElasticSearch which broke Advanced search. [7494](https://github.com/opencrvs/opencrvs-core/issues/7494)

## [1.5.0](https://github.com/opencrvs/opencrvs-core/compare/v1.4.1...v1.5.0)

### Breaking changes

- **Removed dependency on OpenHIM**

  The performance of OpenHIM added an unexpected burden of 200 m/s to every interaction. Cumulatively, this was negatively affecting user experience and therefore we decided to deprecate it.&#x20;

  &#x20;Interested implementers are free to re-introduce OpenHIM should they wish to use it as an interoperability layer without affecting the performance of OpenCRVS now that our architecture no longer depends on it.

  The OpenHIM database is kept for backwards compatibility reasons and will be removed in v1.6. [OpenHIM](https://openhim.org/) is an Open Source middleware component designed for managing FHIR interoperability between disparate systems as part of the OpenHIE architectural specification. We had been using this component in a much more fundamental way to monitor microservice comms in a similar fashion to Amazon SQS. &#x20;

- **Upgrade node version to 18**

  This version enforces environment to have Node 18 installed (supported until April 2025) and removes support for Node 16

  - Use nvm to upgrade your local development environment to use node version `18.19.x.`
  - Specified operating systems in js modules as `darwin, linux`
  - Dev scripts and Vite run with an environment variable `NODE_OPTIONS=--dns-result-order=ipv4first` to resolve ipv4 addresses for `localhost` to support systems that resolves ipv6 addresses by default in Node versions >=17

- **Update the certificate preview mechanism** In effort of minimizing JavaScript-bundle size, we have streamlined the way how review certificate -page renders certificates. In case the images in your certificates are previewing blurry, you need to update your SVG-certificates to print QR-codes and other images directly with `<image width="36" height="36" xlink:href="{{qrCode}}" x="500" y="770"></image>` instead of the more complicated `<rect fill="url(#pattern)"></rect>` -paradigm. This doesn't affect printed certificates as they are still created as previously.
- **Generate default address according to logged-in user's location** We have dropped support for the 'agentDefault' prop which was used as initial value for SELECT_WITH_DYNAMIC_OPTIONS fields. If you have not made any changes to address generation, then this should not affect you. If you have, you can refer to this PR to see how agentDefault has been deprecated in an example country: [https://github.com/opencrvs/opencrvs-farajaland/pull/978](https://github.com/opencrvs/opencrvs-farajaland/pull/978)
- **Remove system admin UI items: Application, User roles** We have now moved to configuring these items away from the UI in favour of directly editing these from country configuration repository in code - specifically in application-config-default.ts.
- **Set Metabase default credentials.** These must be configured via countryconfig repository environment variables and secrets otherwise the dashboard service won't start: OPENCRVS_METABASE_ADMIN_EMAIL & OPENCRVS_METABASE_ADMIN_PASSWORD
- **Check your Metabase map file.** For Metabase configuration, we renamed `farajaland-map.geojson` to `map.geojson` to not tie implementations into example country naming conventions.
- **Feature flags** In order to make application config settings more readable, we re-organised `src/api/application/application-config-default.ts` with a clear feature flag block like so. These are then used across the front and back end of the application to control configurable functionality. New feature flags DEATH_REGISTRATION allow you to optionally run off death registration if your country doesnt want to run its first pilot including death and PRINT_DECLARATION (see New Features) have been added.
  `FEATURES: {
  DEATH_REGISTRATION: true, 
  MARRIAGE_REGISTRATION: false,
  ...
} `
- **Improve rendering of addresses in review page where addresses match** When entering father's address details, some countries make use of a checkbox which says "Address is the same as the mothers. " which, when selected, makes the mother's address and fathers address the same. The checkbox has a programatic value of "Yes" or "No". As a result on the review page, the value "Yes" was displayed which didn't make grammatical sense as a response. We decided to use a custom label: "Same as mother's", which is what was asked on the form. This requires some code changes in the src/form/addresses/index.ts file to pull in the `hideInPreview` prop which will hide the value "Yes" on the review page and replace with a content managed label. Associated bug [#5086](https://github.com/opencrvs/opencrvs-core/issues/5086)

### Infrastructure breaking changes

More improvements have been made to the infrastructure provisioning and Github environment creation scripts and documentation. The complexity is somewhat reduced.

- **We removed the example Wireguard VPN set up as it was confusing.** Our intention was to ensure that all implementers were aware that OpenCRVS should be installed behind a VPN and used Wireguard as an example. But the configuration requirements for Wireguard confused implementers who are not using it. Therefore we decided to remove Wireguard as an example. &#x20;
- **We now have a "backup" Github environment and the backup server is automatically provisioned.** We moved the inventory file location to an explicit directory and removed parameters to scripts that can be automated. To migrate, move all inventory files (qa.yml, production.yml, staging.yml from `infrastructure/server-setup` to `infrastructure/server-setup/inventory` and configure `infrastructure/server-setup/inventory/backup.yml`. Run environment creator for your backup server `yarn environment:init --environment=backup`
- **You can configure the file path on the backup server where backups are stored.** We can also allow using staging to both periodically restore a production backup and also give it the capability if required to backup it's own data to a different location using `backup_server_remote_target_directory` and `backup_server_remote_source_directory` Ansible variables. This use case is mostly meant for OpenCRVS team internal use.
- **We now automate SSH key exchange between application and backup server.** For staging servers, automatically fetch production backup encryption key if periodic restore is enabled using `ansible_ssh_private_key_file` Ansible variables. Therefore documentation is simplified for a new server set-up.
- **In infrastructure Github workflows: SSH_PORT is new and required allowing you the ability to use a non-standard SSH port.** This Github Action environment variable must be added.
- **In infrastructure Github workflows: SSH_HOST** should be moved from being a Github Action environment secret to a Github Action environment variable before it is deprecated in 1.7.0
- **No longer an assumption made that production server Docker replicas and Mongo replica-sets are necessary.** In our Docker Compose files, we had originally assumed that a production deployment would always be deployed on a cluster to enable load balancing. We applied a [Mongo replica set](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L170C3-L201C19) by default on production and set [replicas: 2](https://github.com/opencrvs/opencrvs-countryconfig/blob/48cf278bab9d17e07b60b427294a26c8f35bcc1b/infrastructure/docker-compose.production-deploy.yml#L124) on each microservice. However after experience in multiple countries running small scale pilots, a production deployment usually starts off as 1 server node and then scales into a cluster over time in order to save costs and resources. Therefore these replicas are a waste of resources. So you will notice that this has been deleted. You can always manually add your desired replicas back into you Docker Compose configuration if you want. In Docker Compose files, search for REPLICAS and update accordingly as well as attending to the linked examples.

Follow the descriptions in the migration notes to re-provision all servers safely.

### New features

- Introduced rate limiting to routes that could potentially be bruteforced or extracted PII from.
- The login and client application loading experience has improved. A loading bar appears before the javaScript bundle has loaded and this transitions when fetching records.&#x20;
- Development time logs are now much tidier and errors easier to point out. Production logging will still remain as is.&#x20;
- Masked emails and phone numbers from notification logs.
- Support for landscape certificate templates.
- Allow defining maxLength attribute for number type fields.
- A new certificate handlebar for registration fees has been added `registrationFees`
- A new certificate handlebar for logged-in user details has been added `loggedInUser`&#x20;
- Add support for image compression configuration. Two new properties to this form field are available: `DOCUMENT_UPLOADER_WITH_OPTION`
  - `compressImagesToSizeMB` : An optional prop of number type to define a compressed size. Compression is ignored when the input file is already smaller or equal of the given value or a falsy given value.
  - `maxSizeMB`: An optional validation prop to prevent input of a file bigger than a defined value.
- If a country doesnt wish to use Sentry for logging errors, the SENTRY_DSN variable is now optional and the LogRocket option has been deprecated due to lack of demand.
- Given that upon an upgrade between versions of OpenCRVS, that users cache is cleared, it is important to inform staff to submit any draft applications before the upgrade date. We introduced an "Email all users" feature so that National System Admins can send all staff messages. This feature can be used for any other all staff comms that are deemed required.

<figure><img src="../../.gitbook/assets/Screenshot 2024-06-25 at 17.12.54.png" alt=""><figcaption></figcaption></figure>

- Included an endpoint for serving individual certificates in development mode. This improves the developer experience when configuring certificates.
- Removed logrocket refrences.
- Enable gzip compression in client & login
- Use docker compose v2 in github workflows
- Added SMTP environment variables into the qa compose file to enable QA of SMTP servers.
- In the certificate, the 'Place of Certification' now accurately reflects the correct location.
- Groom's and Bride's name, printIssue translation variables updated [#124](https://github.com/opencrvs/opencrvs-countryconfig/pull/124)
- Add query mapper for International Postal Code field
- Provide env variables for metabase admin credentials
- Improved formatting of informant name for inProgress declaration emails
- There is now an option to print the review page of an event declaration form. The PRINT_DECLARATION feature flag in application config settings can enable this on or off.

### Bug fixes

- Handle back button click after issuing a declaration [#6424](https://github.com/opencrvs/opencrvs-core/issues/6424)
- Fix certificate verification QR code for a death declaration [#6230](https://github.com/opencrvs/opencrvs-core/issues/6230#issuecomment-1996766125)
- Fix certificate verification QR code crashing when gender is unknown [#6422](https://github.com/opencrvs/opencrvs-core/issues/6422)
- Fix certificate verification page missing registration center and the name of registrar [#6614](https://github.com/opencrvs/opencrvs-core/issues/6614)
- Amend certificate verification showing the certifying date instead of records creation date [#7098](https://github.com/opencrvs/opencrvs-core/pull/7098)
- Fix records not getting issued [#6216] (https://github.com/opencrvs/opencrvs-core/issues/6216)
- Fix record correction e2e failing due to stale data getting saved on redux
- Convert eventDates to LocalDate before formatting [#6719](https://github.com/opencrvs/opencrvs-core/issues/6719)
- In advance search, any status tag is showing archived after search [#6678](https://github.com/opencrvs/opencrvs-core/issues/6678)
- Fix first name issues when creating a user [#6631](https://github.com/opencrvs/opencrvs-core/issues/6631)
- Show correct record option in certificate preview page when trying to print by RA [#6224](https://github.com/opencrvs/opencrvs-core/issues/6224)
- Fix certificate templates not getting populated for health facility event locations & ADMIN_LEVEL > 2
- Fix download failure for incomplete (without date of death) death declarations [#6807](https://github.com/opencrvs/opencrvs-core/issues/6807)
- Fix search result declaration record audit unassign issue [#5781](https://github.com/opencrvs/opencrvs-core/issues/5781)
- In review page, Eliminating the 'No supporting documents' and 'upload' prompts when documents are already uploaded [#6231] (https://github.com/opencrvs/opencrvs-core/issues/6231)
- Fix Registrar of any location should be able to review a correction request [#6247](https://github.com/opencrvs/opencrvs-core/issues/6247)
- remove upload button when no supporting docs are configured [#5944](https://github.com/opencrvs/opencrvs-core/issues/5944)
- Fix issues of invisible inputs when navigating from can't login link in login page [#6163](https://github.com/opencrvs/opencrvs-core/issues/6163)
- Fix the "Continue" button being disabled when changes in correction form is made [#6780](https://github.com/opencrvs/opencrvs-core/issues/6780)
- Remove leading slash from `resendAuthenticationCode` in login to fix resend email button [#6987](https://github.com/opencrvs/opencrvs-core/issues/6987) [#7037](https://github.com/opencrvs/opencrvs-core/issues/7037)
- Fix dashboard cron jobs not working [#7016](https://github.com/opencrvs/opencrvs-core/issues/7016)
- Fix client modal glitches on integrations page [#7002] (https://github.com/opencrvs/opencrvs-core/issues/7002)
- Fix 'Place of Certification' is showing wrong in certificate [#7060] (https://github.com/opencrvs/opencrvs-core/issues/7060)
- Fix Check for valid date to handle incomplete marriage declarations [#7017](https://github.com/opencrvs/opencrvs-core/issues/7017)
- Fix session expiration when user tries to change phone number [#7003](https://github.com/opencrvs/opencrvs-core/pull/7025)
- Fix French translation missing for relationship to informant when trying to correct record, print and issue record [#6341] (https://github.com/opencrvs/opencrvs-core/issues/6341)
- Fix print record page for an unsaved declaration [#6893](https://github.com/opencrvs/opencrvs-core/issues/6893)
- Fix Reset pagination to default page (1) when location changes in UserList [#6481](https://github.com/opencrvs/opencrvs-core/issues/6481)
- Fix unassign action not appearing in audit history [#7035](https://github.com/opencrvs/opencrvs-core/pull/7072)
- Fix client modal glitches on integrations page [#7002](https://github.com/opencrvs/opencrvs-core/issues/7002)
- Fix address property handling and corrected country data transformation logic [#6989](https://github.com/opencrvs/opencrvs-core/issues/6989)
- Fix "Print and issue to groom|bride" is added to a different variable [#7066](https://github.com/opencrvs/opencrvs-core/pull/7066)
- Fix search query is not being saved in the advanced search results [#7110](https://github.com/opencrvs/opencrvs-core/pull/7117)
- Fix Removed duplicateTrackingId check in createDuplicateTask method [#7081](https://github.com/opencrvs/opencrvs-core/pull/7081)
- Fix Disabling 'Mark as duplicate' button when duplicate reason is empty too [#7083](https://github.com/opencrvs/opencrvs-core/pull/7083)
- Fix correction done from a certificate preview page [#7065](https://github.com/opencrvs/opencrvs-core/pull/7093)
- Fix certificate overflowing in preview certificate view [#7157](https://github.com/opencrvs/opencrvs-core/pull/7157)
- Fix records going completely missing when an unexpected error happens in the backend [#7021](https://github.com/opencrvs/opencrvs-core/pull/7021)
- Fix search indexing BRN's in place of identifiers. Adds spouseIdentifier to search with [#7189](https://github.com/opencrvs/opencrvs-core/pull/7189)
- Rename `farajaland-map.geojson` in dashboards to `map.geojson` to not tie opencrvs-core into a specific country implementation name [#7251](https://github.com/opencrvs/opencrvs-core/pull/7251)
- Update advanced search list properly when assignments change [#7307](https://github.com/opencrvs/opencrvs-core/pull/7307)
- Update Content-Security-Policy to allow loading fonts from country configuration [#7296](https://github.com/opencrvs/opencrvs-core/pull/7296)
- Fix frontend crashing on 'Registration by Status' under performance due to missing translations [#7129](https://github.com/opencrvs/opencrvs-core/pull/7129)
- Fix email of practitioner to be saved in hearth. A migration is added to correct the email of practitoiner in existing db. [7315](https://github.com/opencrvs/opencrvs-core/pull/7315)
- Fix inaccessible and only partly visible "Edit" button in "Advanced Search" - feature's date range list [7485](https://github.com/opencrvs/opencrvs-core/pull/7485)

## [1.3.4](https://github.com/opencrvs/opencrvs-core/compare/v1.3.3...v1.3.4)

### Bug fixes

- #### Include middlename when generating fullnames
  - Refactored out the scattered logic for generating fullnames and converged them into a single function
  - Make lastname optional for a registered declaration
- #### Recognize occupation as an optional field in informant section
- #### Fix download failure when `arrayToFieldTransormer` is used in template mapping
- #### Fix multiple records not being downloaded simultaneously [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- #### Fix showing unassigned toast for reinstated declarations [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- #### Fix system crash when opening the started action modal [#6551](https://github.com/opencrvs/opencrvs-core/issues/6551)
- #### Convert eventDates to LocalDate before formatting [#6719](https://github.com/opencrvs/opencrvs-core/issues/6719)

## [1.4.1](https://github.com/opencrvs/opencrvs-core/compare/v1.4.0...v1.4.1)

- Fix Metabase versions in Dashboards service. Previously the version used for local development wasn't the one built into the docker image, which caused the locally generated initialisation file to fail in deployed environments.
- Fix a seeding script bug, where it failed when done too quickly [#6553](https://github.com/opencrvs/opencrvs-core/issues/6553)
- Update minimum password length validation [#6559](https://github.com/opencrvs/opencrvs-core/issues/6559)
- Include middlename when generating fullnames
  - Refactored out the scattered logic for generating fullnames and converged them into a single function
  - Make lastname optional for a registered declaration
- Recognize occupation as an optional field in informant section
- Fix download failure when `arrayToFieldTransormer` is used in template mapping
- Fix multiple records not being downloaded simultaneously [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- Fix showing unassigned toast for reinstated declarations [#6492](https://github.com/opencrvs/opencrvs-core/issues/6492#issuecomment-1961098936)
- Fix system crash when opening the started action modal [#6551](https://github.com/opencrvs/opencrvs-core/issues/6551)
- Make language names used in language select dropdowns configurable in country resource package copy
- Fix login to field agent when an incomplete record is previously retrieved by them [#6584](https://github.com/opencrvs/opencrvs-core/issues/6584)

## [1.4.0](https://github.com/opencrvs/opencrvs-core/compare/v1.3.3...v1.4.0)

In this release, we made **no changes** to OpenCRVS Core. All changes in this release apply only to the [OpenCRVS country configuration](https://github.com/opencrvs/opencrvs-countryconfig/releases/tag/v1.4.0) repository.

### Please note for 1.5.0 release

In the next OpenCRVS release v1.5.0, there will be two significant changes both in the country resource package and the infrastructure configuration inside of it:

- The `infrastructure` directory and related pipelines will be moved to a new repository.
- Both the new infrastructure repository and the OpenCRVS country resource package repositories will start following their own release cycles, mostly independent from the core's release cycle. From this release forward, both packages are released as "OpenCRVS minor compatible" releases, meaning that the OpenCRVS countryconfig 1.3.0-<incrementing release number> is compatible with OpenCRVS 1.3.0, 1.3.1, 1.3.2, etc. This allows for the release of new hotfix versions of the core without having to publish a new version of the infrastructure or countryconfig.

## [1.3.3](https://github.com/opencrvs/opencrvs-core/compare/v1.3.2...v1.3.3)

### New features

- **New handlebars serving the location ids of the admin level locations**

  Apart from the new handlebars, a couple more improvements were introduced:

  - stricter type for locations in client
  - **"location"** handlebar helper can now resolve offices & facilities
  - restrict the properties exposed through **"location"** handlebar helper
  - remove deprecated **DIVISION** & **UNION** from client

### Bug fixes

- #### Fix location seeding scripts throwing error when there are too many source locations from the country config
  Locations are now seeded in smaller segments instead of one big collection. The newer approach has improved performance to a significant extent and also clears the interruption caused for a large number of country config locations
- Filter user information such as usernames and authentication codes from server logs
- Core not recognizing "occupation" as an optional field for deceased
- Unassign declaration from a user if the declaration has already been proceeded through the workqueues by a separate user

### Dependency upgrades

- **Metabase from v0.45.2.1 to v0.46.6.1**

See [Releases](https://github.com/opencrvs/opencrvs-core/releases) for release notes of older releases.

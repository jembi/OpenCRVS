/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { Header } from '@client/components/Header/Header'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { EMPTY_STRING } from '@client/utils/constants'
import {
  EventType,
  System,
  SystemStatus,
  SystemType,
  WebhookPermission
} from '@client/utils/gateway'
import { Label } from '@client/views/Settings/items/components'
import { DeleteSystemModal } from '@client/views/SysAdmin/Config/Systems/DeleteSystemModal'
import { WebhookModal } from '@client/views/SysAdmin/Config/Systems/WebhookModal'
import {
  Alert,
  CheckboxGroup,
  InputField,
  Link,
  ListViewItemSimplified,
  ListViewSimplified,
  Pill,
  Select,
  Spinner,
  Stack,
  TextInput,
  Toast,
  ToggleMenu
} from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { Content } from '@opencrvs/components/lib/Content'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Text } from '@opencrvs/components/lib/Text'
import React, { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useSystems } from './useSystems'
import { CopyButton } from '@opencrvs/components/lib/CopyButton/CopyButton'

interface ToggleModal {
  modalVisible: boolean
  selectedClient: System | null
}

const ButtonLink = styled(Link)`
  text-align: left;
`

const PaddedAlert = styled(Alert)`
  margin-top: 16px;
`

const StyledSpinner = styled(Spinner)`
  margin: 10px 0;
`
const Field = styled.div`
  margin-top: 16px;
`
const populatePermissions = (
  webhooks: WebhookPermission[] = [],
  type: string
) => {
  const { __typename, ...rest } = webhooks.find((ite) => ite.event === type)!
  return rest
}

export function SystemList() {
  const intl = useIntl()
  const [showModal, setShowModal] = React.useState(false)
  const [toggleKeyModal, setToggleKeyModal] = useState<ToggleModal>({
    modalVisible: false,
    selectedClient: null
  })

  const [selectedTab, setSelectedTab] = React.useState(EventType.Birth)

  const checkboxHandler = (permissions: string[], event: EventType) => {
    event === EventType.Birth
      ? setBirthPermissions({ event, permissions })
      : setDeathPermissions({ event, permissions })
  }

  const toggleModal = useCallback(() => {
    setShowModal((prev) => !prev)
  }, [])

  const {
    closePermissionModal,
    systemToDeleteData,
    deleteSystem,
    systemToDelete,
    setSystemToDelete,
    systemToDeleteLoading,
    systemToDeleteError,
    updatePermissionsData,
    updatePermissionsLoading,
    updatePermissionsError,
    updatePermissions,
    systemToShowPermission,
    setSystemToShowPermission,
    birthPermissions,
    setBirthPermissions,
    deathPermissions,
    setDeathPermissions,
    existingSystems,
    deactivateSystem,
    systemToToggleActivation,
    setSystemToToggleActivation,
    activateSystem,
    registerSystem,
    registerSystemData,
    newClientName,
    newSystemType,
    setNewSystemType,
    onChangeClientName,
    activateSystemLoading,
    deactivateSystemLoading,
    registerSystemLoading,
    registerSystemError,
    activateSystemData,
    deactivateSystemData,
    activateSystemError,
    deactivateSystemError,
    clearNewSystemDraft,
    clientRefreshToken,
    refreshTokenData,
    refreshTokenLoading,
    refreshTokenError,
    resetData
  } = useSystems()

  function changeActiveStatusIntl(status: SystemStatus) {
    if (status !== SystemStatus.Active) {
      return intl.formatMessage(integrationMessages.activate)
    } else {
      return intl.formatMessage(integrationMessages.deactivate)
    }
  }

  const toggleRevealKeyModal = useCallback(
    function toggleRevealKeyModal(system?: System) {
      if (system !== undefined) {
        setToggleKeyModal({
          ...toggleKeyModal,
          modalVisible: true,
          selectedClient: system
        })
      } else {
        setToggleKeyModal({
          ...toggleKeyModal,
          modalVisible: false
        })
      }
    },
    [toggleKeyModal]
  )

  const getMenuItems = (system: System) => {
    const menuItems: { handler: () => void; label: string }[] = [
      {
        handler: () => {
          toggleRevealKeyModal(system)
        },
        label: intl.formatMessage(integrationMessages.revealKeys)
      }
    ]

    if (system.type === SystemType.Webhook) {
      menuItems.push({
        handler: () => {
          setSystemToShowPermission(system)
          setBirthPermissions(
            populatePermissions(system.settings!.webhook!, EventType.Birth)
          )
          setDeathPermissions(
            populatePermissions(system.settings!.webhook!, EventType.Death)
          )
        },
        label: intl.formatMessage(buttonMessages.edit)
      })
    }

    menuItems.push({
      handler: () => {
        setSystemToToggleActivation(system)
      },
      label: changeActiveStatusIntl(system.status)
    })

    menuItems.push({
      handler: () => {
        setSystemToDelete(system)
      },
      label: intl.formatMessage(integrationMessages.delete)
    })

    return menuItems
  }

  const systemTypeLabels = {
    HEALTH: intl.formatMessage(integrationMessages.eventNotification),
    RECORD_SEARCH: intl.formatMessage(integrationMessages.recordSearch),
    NATIONAL_ID: intl.formatMessage(integrationMessages.nationalId),
    WEBHOOK: intl.formatMessage(integrationMessages.webhook)
  }

  const systemToLabel = (system: System) => {
    return systemTypeLabels[system.type]
  }

  return (
    <Frame
      header={
        <Header
          mobileRight={[
            {
              icon: () => <Icon name="Plus" />,
              handler: toggleModal
            }
          ]}
        />
      }
      navigation={<Navigation loadWorkqueueStatuses={false} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Content
        title={intl.formatMessage(integrationMessages.pageTitle)}
        topActionButtons={[
          <Button
            key="create-client-button"
            type="secondary"
            id="createClientButton"
            onClick={() => setShowModal(true)}
          >
            <Icon name="Plus" />
            {intl.formatMessage(integrationMessages.createClient)}
          </Button>
        ]}
      >
        {intl.formatMessage(integrationMessages.pageIntroduction)}

        <ListViewSimplified>
          {existingSystems.map((system: System) => (
            <ListViewItemSimplified
              key={system.clientId}
              actions={
                <>
                  {system.status === SystemStatus.Active ? (
                    <Pill
                      label={intl.formatMessage(integrationMessages.active)}
                      type="active"
                    />
                  ) : (
                    <Pill
                      label={intl.formatMessage(integrationMessages.inactive)}
                      type="inactive"
                    />
                  )}

                  <ToggleMenu
                    id={`toggleMenu-${system.clientId}`}
                    menuItems={getMenuItems(system)}
                    toggleButton={
                      <Icon
                        name="DotsThreeVertical"
                        color="primary"
                        size="large"
                      />
                    }
                  />
                </>
              }
              label={system.name}
              value={systemToLabel(system)}
            />
          ))}

          {systemToToggleActivation && (
            <ResponsiveModal
              title={
                systemToToggleActivation.status === SystemStatus.Active
                  ? intl.formatMessage(integrationMessages.deactivateClient)
                  : intl.formatMessage(integrationMessages.activateClient)
              }
              contentHeight={50}
              responsive={false}
              actions={[
                <Button
                  type="tertiary"
                  id="cancel"
                  key="cancel"
                  onClick={() => {
                    setSystemToToggleActivation(undefined)
                  }}
                >
                  {intl.formatMessage(buttonMessages.cancel)}
                </Button>,

                systemToToggleActivation.status === SystemStatus.Active ? (
                  <Button
                    type="primary"
                    key="confirm"
                    id="confirm"
                    loading={deactivateSystemLoading}
                    onClick={() => {
                      deactivateSystem()
                    }}
                  >
                    {intl.formatMessage(buttonMessages.confirm)}
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    key="confirm"
                    id="confirm"
                    loading={activateSystemLoading}
                    onClick={() => {
                      activateSystem()
                    }}
                  >
                    {intl.formatMessage(buttonMessages.confirm)}
                  </Button>
                )
              ]}
              show={true}
              handleClose={() => setSystemToToggleActivation(undefined)}
            >
              {systemToToggleActivation.status === SystemStatus.Active
                ? intl.formatMessage(integrationMessages.deactivateClientText)
                : intl.formatMessage(integrationMessages.activateClientText)}
            </ResponsiveModal>
          )}
        </ListViewSimplified>
        <ResponsiveModal
          actions={[
            <Link
              key="cancel-link"
              onClick={() => {
                toggleRevealKeyModal()
                resetData()
              }}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Link>
          ]}
          autoHeight={true}
          width={512}
          titleHeightAuto={true}
          show={toggleKeyModal.modalVisible}
          handleClose={() => {
            toggleRevealKeyModal()
            resetData()
          }}
          title={toggleKeyModal.selectedClient?.name ?? ''}
        >
          <Text variant="reg16" element="p" id="revealKeyId">
            {intl.formatMessage(integrationMessages.uniqueKeysDescription)}
          </Text>

          <Stack alignItems="stretch" direction="column" gap={16}>
            <Stack alignItems="stretch" direction="column" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientId)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {toggleKeyModal.selectedClient?.clientId}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={toggleKeyModal.selectedClient?.clientId as string}
                />
              </Stack>
            </Stack>
            <Stack direction="column" alignItems="stretch" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientSecret)}
              </Text>
              {refreshTokenLoading ? (
                <Spinner baseColor="#4C68C1" id="Spinner" size={24} />
              ) : refreshTokenData && refreshTokenData?.refreshSystemSecret ? (
                <Stack justifyContent="space-between" alignItems="center">
                  <Text variant="reg16" element="span">
                    {refreshTokenData.refreshSystemSecret?.clientSecret}
                  </Text>
                  <CopyButton
                    copiedLabel={intl.formatMessage(buttonMessages.copied)}
                    copyLabel={intl.formatMessage(buttonMessages.copy)}
                    data={
                      refreshTokenData.refreshSystemSecret
                        ?.clientSecret as string
                    }
                  />
                </Stack>
              ) : (
                <ButtonLink
                  onClick={() => {
                    clientRefreshToken(toggleKeyModal.selectedClient?.clientId)
                  }}
                >
                  {intl.formatMessage(buttonMessages.refresh)}
                </ButtonLink>
              )}
            </Stack>
            <Stack direction="column" alignItems="stretch" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.shaSecret)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {toggleKeyModal.selectedClient?.shaSecret}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={toggleKeyModal.selectedClient?.shaSecret as string}
                />
              </Stack>
            </Stack>
          </Stack>
        </ResponsiveModal>
      </Content>
      <ResponsiveModal
        actions={
          registerSystemData
            ? []
            : [
                <Link
                  key="cancel"
                  onClick={() => {
                    toggleModal()
                    clearNewSystemDraft()
                    resetData()
                  }}
                >
                  {intl.formatMessage(buttonMessages.cancel)}
                </Link>,
                <Button
                  key="submit-client-form"
                  id="submitClientForm"
                  disabled={!newSystemType || newClientName === EMPTY_STRING}
                  onClick={() => {
                    registerSystem()
                  }}
                  type="primary"
                >
                  {intl.formatMessage(buttonMessages.create)}
                </Button>
              ]
        }
        width={512}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        handleClose={() => {
          toggleModal()
          clearNewSystemDraft()
          resetData()
        }}
        title={
          registerSystemData?.registerSystem?.system.name ??
          intl.formatMessage(integrationMessages.createClient)
        }
        id="createClientModal"
      >
        <Text variant="reg16" element="p" id="uniqueKeyId">
          {!registerSystemData && !registerSystemLoading
            ? intl.formatMessage(integrationMessages.newIntegrationDescription)
            : intl.formatMessage(integrationMessages.uniqueKeysDescription)}
        </Text>

        {!registerSystemData && !registerSystemLoading && (
          <>
            <Field>
              <InputField
                id="name_of_client"
                touched={false}
                required={true}
                label={intl.formatMessage(integrationMessages.name)}
              >
                <TextInput
                  id="client_name"
                  type="text"
                  value={newClientName}
                  onChange={onChangeClientName}
                  error={false}
                />
              </InputField>
            </Field>

            <Field>
              <InputField
                id="select-input"
                touched={false}
                label={intl.formatMessage(integrationMessages.type)}
              >
                <Select
                  onChange={(val) => {
                    setNewSystemType(val as SystemType)
                  }}
                  value={newSystemType ?? SystemType.Health}
                  options={[
                    {
                      label: intl.formatMessage(
                        integrationMessages.eventNotification
                      ),
                      value: SystemType.Health
                    },
                    {
                      label: intl.formatMessage(
                        integrationMessages.recordSearch
                      ),
                      value: SystemType.RecordSearch
                    },
                    {
                      label: intl.formatMessage(integrationMessages.webhook),
                      value: SystemType.Webhook
                    }
                  ]}
                  id={'permissions-selectors'}
                />
              </InputField>
            </Field>

            {newSystemType === SystemType.Health && (
              <PaddedAlert type="info">
                {intl.formatMessage(
                  integrationMessages.healthnotificationAlertDescription
                )}
                <Link
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                  font="bold16"
                >
                  documentation.opencrvs.org
                </Link>
              </PaddedAlert>
            )}

            {newSystemType === SystemType.RecordSearch && (
              <PaddedAlert type="info">
                {intl.formatMessage(
                  integrationMessages.recordSearchDescription
                )}
                {'\n'}
                <Link
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                  font="bold16"
                >
                  documentation.opencrvs.org
                </Link>
              </PaddedAlert>
            )}

            {newSystemType === SystemType.Webhook && (
              <>
                <PaddedAlert type="info">
                  {intl.formatMessage(integrationMessages.webhookDescription)}
                  {'\n'}
                  <Link
                    onClick={() => {
                      window.open(
                        'https://documentation.opencrvs.org/',
                        '_blank'
                      )
                    }}
                    font="bold16"
                  >
                    documentation.opencrvs.org
                  </Link>
                </PaddedAlert>
                <Field>
                  <InputField
                    id="select-input"
                    touched={false}
                    label={intl.formatMessage(integrationMessages.label)}
                  >
                    <div>
                      <Label>
                        {intl.formatMessage(
                          integrationMessages.webhookPermissionsDescription
                        )}
                      </Label>
                      <FormTabs
                        sections={[
                          {
                            id: EventType.Birth,
                            title: intl.formatMessage(integrationMessages.birth)
                          },
                          {
                            id: EventType.Death,
                            title: intl.formatMessage(integrationMessages.death)
                          }
                        ]}
                        activeTabId={selectedTab}
                        onTabClick={(tabId: EventType) => setSelectedTab(tabId)}
                      />
                      {selectedTab === EventType.Birth ? (
                        <CheckboxGroup
                          id="birthCheckboxGroup"
                          options={[
                            {
                              label: intl.formatMessage(
                                integrationMessages.childDetails
                              ),
                              value: 'child-details'
                            },
                            {
                              label: intl.formatMessage(
                                integrationMessages.motherDetails
                              ),
                              value: 'mother-details'
                            },
                            {
                              label: intl.formatMessage(
                                integrationMessages.fatherDetails
                              ),
                              value: 'father-details'
                            },
                            {
                              label: intl.formatMessage(
                                integrationMessages.informantDetails
                              ),
                              value: 'informant-details'
                            },
                            {
                              label: intl.formatMessage(
                                integrationMessages.documentDetails
                              ),
                              value: 'supporting-documents'
                            }
                          ]}
                          name="test-checkbox-group1"
                          value={birthPermissions.permissions ?? []}
                          onChange={(newValue) => {
                            checkboxHandler(newValue, EventType.Birth)
                          }}
                        />
                      ) : (
                        <CheckboxGroup
                          id="deathCheckboxGroup"
                          options={[
                            {
                              label: intl.formatMessage(
                                integrationMessages.deceasedDetails
                              ),
                              value: 'deceased-details'
                            },
                            {
                              label: intl.formatMessage(
                                integrationMessages.deathEventDetails
                              ),
                              value: 'death-encounter'
                            },
                            {
                              label: intl.formatMessage(
                                integrationMessages.informantDetails
                              ),
                              value: 'informant-details'
                            },
                            {
                              label: intl.formatMessage(
                                integrationMessages.documentDetails
                              ),
                              value: 'supporting-documents'
                            }
                          ]}
                          name="test-checkbox-group1"
                          value={deathPermissions.permissions ?? []}
                          onChange={(newValue) => {
                            checkboxHandler(newValue, EventType.Death)
                          }}
                        />
                      )}
                    </div>
                  </InputField>
                </Field>
              </>
            )}
          </>
        )}

        {!registerSystemData && registerSystemLoading && (
          <>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientId)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientSecret)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.shaSecret)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
          </>
        )}

        {registerSystemData?.registerSystem && (
          <Stack alignItems="stretch" direction="column" gap={16}>
            <Stack alignItems="stretch" direction="column" gap={4}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientId)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {registerSystemData.registerSystem.system.clientId}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={
                    registerSystemData.registerSystem.system.clientId as string
                  }
                />
              </Stack>
            </Stack>
            <Stack alignItems="stretch" direction="column" gap={4}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientSecret)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {registerSystemData.registerSystem.clientSecret}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={
                    registerSystemData.registerSystem.clientSecret as string
                  }
                />
              </Stack>
            </Stack>
            <Stack alignItems="stretch" direction="column" gap={4}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.shaSecret)}
              </Text>
              <Stack justifyContent="space-between" alignItems="center">
                <Text variant="reg16" element="span">
                  {registerSystemData.registerSystem.system.shaSecret}
                </Text>
                <CopyButton
                  copiedLabel={intl.formatMessage(buttonMessages.copied)}
                  copyLabel={intl.formatMessage(buttonMessages.copy)}
                  data={
                    registerSystemData.registerSystem.system.shaSecret as string
                  }
                />
              </Stack>
            </Stack>
          </Stack>
        )}
      </ResponsiveModal>

      {systemToShowPermission && (
        <WebhookModal
          system={systemToShowPermission}
          loading={updatePermissionsLoading}
          updatePermissions={updatePermissions}
          birthPermissions={birthPermissions}
          deathPermissions={deathPermissions}
          setBirthPermissions={setBirthPermissions}
          setDeathPermissions={setDeathPermissions}
          closeModal={closePermissionModal}
        />
      )}

      {systemToDelete && (
        <DeleteSystemModal
          system={systemToDelete}
          loading={systemToDeleteLoading}
          closeModal={() => setSystemToDelete(undefined)}
          deleteSystem={deleteSystem}
        />
      )}

      {activateSystemData && (
        <Toast
          type="success"
          id="toggleClientActiveStatusToast"
          onClose={() => resetData()}
        >
          {intl.formatMessage(integrationMessages.activateClientStatus)}
        </Toast>
      )}
      {deactivateSystemData && (
        <Toast
          type="success"
          id="toggleClientDeActiveStatusToast"
          onClose={() => resetData()}
        >
          {intl.formatMessage(integrationMessages.deactivateClientStatus)}
        </Toast>
      )}
      {updatePermissionsData && (
        <Toast
          type="success"
          id="updaPermissionsSuccess"
          onClose={() => resetData()}
        >
          {intl.formatMessage(integrationMessages.updatePermissionsMsg)}
        </Toast>
      )}

      {systemToDeleteData && (
        <Toast
          type="success"
          id="systemToDeleteSuccess"
          onClose={() => resetData()}
        >
          {intl.formatMessage(integrationMessages.deleteSystemMsg)}
        </Toast>
      )}

      {(activateSystemError ||
        deactivateSystemError ||
        registerSystemError ||
        refreshTokenError ||
        updatePermissionsError ||
        systemToDeleteError) && (
        <Toast
          type="error"
          id="toggleClientStatusToast"
          onClose={() => {
            resetData()
          }}
        >
          {intl.formatMessage(integrationMessages.error)}
        </Toast>
      )}
    </Frame>
  )
}

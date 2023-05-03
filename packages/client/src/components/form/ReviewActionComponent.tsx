/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  DangerButton,
  ICON_ALIGNMENT,
  PrimaryButton,
  SuccessButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { Upload, Check, Cross } from '@opencrvs/components/lib/icons'
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import { messages } from '@client/i18n/messages/views/review'
import { buttonMessages } from '@client/i18n/messages'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { SubmissionAction } from '@client/forms'
import styled from '@client/styledComponents'
import * as React from 'react'
import { EVENT_STATUS } from '@client/workqueue'

interface IReviewActionProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  draftDeclaration?: boolean
  completeDeclaration: boolean
  totalFileSizeExceeded: boolean
  declarationToBeValidated?: boolean
  declarationToBeRegistered?: boolean
  alreadyRejectedDeclaration: boolean
  declaration: IDeclaration
  submitDeclarationAction: (
    declaration: IDeclaration,
    submissionStatus: string,
    action: SubmissionAction
  ) => void
  rejectDeclarationAction?: () => void
}

const Container = styled.div`
  position: relative;
  margin-top: 32px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100vw;
    margin: 32px -32px -32px -24px;
  }
`
const Content = styled.div`
  z-index: 1;
  padding: 24px 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding-bottom: 32px;
  }
`
const UnderLayBackground = styled.div<{ background: string }>`
  background-color: ${({ background, theme }) =>
    background === 'success'
      ? theme.colors.positive
      : background === 'error'
      ? theme.colors.negative
      : theme.colors.redDark};
  position: absolute;
  border-radius: 4px;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.1;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h4}
  margin-bottom: 8px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.bold16}
  }
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  margin-bottom: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.reg16}
  }
`

const ActionContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  button:first-child {
    margin-right: 16px;
  }

  & > button {
    margin-bottom: 8px;
  }
`

enum ACTION {
  DECLARATION_TO_BE_DECLARED = 'DECLARATION_TO_BE_DECLARED',
  DECLARATION_TO_BE_VALIDATED = 'DECLARATION_TO_BE_VALIDATED',
  DECLARATION_TO_BE_REGISTERED = 'DECLARATION_TO_BE_REGISTERED'
}

const ACTION_TO_CONTENT_MAP: { [key: string]: any } = {
  [String(ACTION.DECLARATION_TO_BE_DECLARED)]: {
    draftStatus: {
      true: {
        completionStatus: {
          true: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeDeclaration: true }
            },
            description: {
              message: messages.reviewActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.submitConfirmationTitle,
                payload: { completeDeclaration: true }
              },
              description: {
                message: messages.submitConfirmationDesc,
                payload: { completeDeclaration: true }
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeDeclaration: false }
            },
            description: {
              message: messages.reviewActionDescriptionIncomplete
            },
            modal: {
              title: {
                message: messages.submitConfirmationTitle,
                payload: { completeDeclaration: false }
              },
              description: {
                message: messages.submitConfirmationDesc,
                payload: { completeDeclaration: false }
              }
            }
          }
        }
      }
    }
  },
  [String(ACTION.DECLARATION_TO_BE_VALIDATED)]: {
    draftStatus: {
      true: {
        completionStatus: {
          true: {
            title: {
              message: messages.approvalActionTitle,
              payload: { draftStatus: true }
            },
            description: {
              message: messages.approvalActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.validateConfirmationTitle,
                payload: { completeDeclaration: true }
              },
              description: {
                message: messages.validateConfirmationDesc,
                payload: { completeDeclaration: true }
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeDeclaration: false }
            },
            description: {
              message: messages.approvalActionDescriptionIncomplete
            }
          }
        }
      },
      false: {
        completionStatus: {
          true: {
            title: {
              message: messages.approvalActionTitle,
              payload: { draftStatus: false }
            },
            description: {
              message: messages.approvalActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.validateConfirmationTitle,
                payload: { completeDeclaration: true }
              },
              description: {
                message: messages.validateConfirmationDesc,
                payload: { completeDeclaration: true }
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeDeclaration: false }
            },
            description: {
              message: messages.approvalActionDescriptionIncomplete
            }
          }
        }
      }
    }
  },
  [String(ACTION.DECLARATION_TO_BE_REGISTERED)]: {
    draftStatus: {
      true: {
        completionStatus: {
          true: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeDeclaration: true }
            },
            description: {
              message: messages.registerActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.registerConfirmationTitle
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionToBeRegisteredTitle,
              payload: { completeDeclaration: false }
            },
            description: {
              message: messages.registerActionDescriptionNotToBeRegistered
            }
          }
        }
      },
      false: {
        completionStatus: {
          true: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeDeclaration: true }
            },
            description: {
              message: messages.registerActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.registerConfirmationTitle
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionToBeRegisteredTitle,
              payload: { completeDeclaration: false }
            },
            description: {
              message: messages.registerActionDescriptionNotToBeRegistered
            }
          }
        }
      }
    }
  }
}

interface IReviewActionState {
  showSubmitModal: boolean
}
class ReviewActionComponent extends React.Component<
  IReviewActionProps & IntlShapeProps,
  IReviewActionState
> {
  state = { showSubmitModal: false }
  toggleSubmitModalOpen = () => {
    this.setState((prevState) => ({
      showSubmitModal: !prevState.showSubmitModal
    }))
  }
  render() {
    const {
      id,
      declarationToBeValidated,
      declarationToBeRegistered,
      alreadyRejectedDeclaration,
      completeDeclaration,
      totalFileSizeExceeded,
      declaration,
      submitDeclarationAction,
      draftDeclaration,
      rejectDeclarationAction,
      intl
    } = this.props

    const isValidated = declarationToBeRegistered
      ? declaration.registrationStatus === EVENT_STATUS.VALIDATED
      : declarationToBeValidated

    const background = !completeDeclaration
      ? 'error'
      : declarationToBeRegistered
      ? draftDeclaration
        ? ''
        : isValidated
        ? 'success'
        : ''
      : declarationToBeValidated
      ? 'success'
      : draftDeclaration
      ? 'success'
      : ''

    const action = declarationToBeRegistered
      ? ACTION.DECLARATION_TO_BE_REGISTERED
      : declarationToBeValidated
      ? ACTION.DECLARATION_TO_BE_VALIDATED
      : ACTION.DECLARATION_TO_BE_DECLARED

    const completionStatus = declarationToBeRegistered
      ? draftDeclaration
        ? false
        : isValidated
      : completeDeclaration

    const actionContent =
      (ACTION_TO_CONTENT_MAP[action].draftStatus[String(draftDeclaration)] &&
        ACTION_TO_CONTENT_MAP[action].draftStatus[String(draftDeclaration)]
          .completionStatus[String(completionStatus)]) ||
      null

    return !actionContent ? null : (
      <Container id={id}>
        <UnderLayBackground background={background} />
        <Content>
          <Title>
            {intl.formatMessage(
              actionContent.title.message,
              actionContent.title.payload
            )}
          </Title>
          <Description>
            {intl.formatMessage(actionContent.description.message, {
              eventType: declaration.event
            })}
          </Description>
          <ActionContainer>
            {declarationToBeRegistered ? (
              <SuccessButton
                id="registerDeclarationBtn"
                icon={() => <Check />}
                onClick={this.toggleSubmitModalOpen}
                disabled={
                  !completeDeclaration || totalFileSizeExceeded || !isValidated
                }
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(buttonMessages.register)}
              </SuccessButton>
            ) : declarationToBeValidated ? (
              <SuccessButton
                id="validateDeclarationBtn"
                icon={() => <Upload />}
                onClick={this.toggleSubmitModalOpen}
                disabled={!completeDeclaration || totalFileSizeExceeded}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(buttonMessages.sendForApproval)}
              </SuccessButton>
            ) : (
              <PrimaryButton
                id="submit_form"
                icon={() => <Upload />}
                onClick={this.toggleSubmitModalOpen}
                disabled={totalFileSizeExceeded}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(
                  completeDeclaration
                    ? buttonMessages.sendForReview
                    : buttonMessages.sendIncomplete
                )}
              </PrimaryButton>
            )}

            {rejectDeclarationAction && !alreadyRejectedDeclaration && (
              <DangerButton
                id="rejectDeclarationBtn"
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <Cross color="currentColor" />}
                onClick={rejectDeclarationAction}
              >
                {intl.formatMessage(buttonMessages.reject)}
              </DangerButton>
            )}
          </ActionContainer>
        </Content>
        {actionContent.modal && (
          <ResponsiveModal
            title={intl.formatMessage(actionContent.modal.title.message, {
              ...actionContent.modal.title.payload,
              event: declaration.event
            })}
            responsive={false}
            autoHeight={true}
            actions={[
              <TertiaryButton
                id="cancel-btn"
                key="cancel"
                onClick={() => {
                  this.toggleSubmitModalOpen()
                  if (document.documentElement) {
                    document.documentElement.scrollTop = 0
                  }
                }}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <PrimaryButton
                key="submit"
                id="submit_confirm"
                onClick={() =>
                  draftDeclaration
                    ? submitDeclarationAction(
                        declaration,
                        SUBMISSION_STATUS.READY_TO_SUBMIT,
                        SubmissionAction.SUBMIT_FOR_REVIEW
                      )
                    : declarationToBeRegistered
                    ? submitDeclarationAction(
                        declaration,
                        SUBMISSION_STATUS.READY_TO_REGISTER,
                        SubmissionAction.REGISTER_DECLARATION
                      )
                    : submitDeclarationAction(
                        declaration,
                        SUBMISSION_STATUS.READY_TO_APPROVE,
                        SubmissionAction.APPROVE_DECLARATION
                      )
                }
              >
                {declarationToBeRegistered
                  ? intl.formatMessage(buttonMessages.register)
                  : declarationToBeValidated
                  ? intl.formatMessage(buttonMessages.send)
                  : intl.formatMessage(buttonMessages.send)}
              </PrimaryButton>
            ]}
            show={this.state.showSubmitModal}
            handleClose={this.toggleSubmitModalOpen}
          >
            {actionContent.modal.description &&
              intl.formatMessage(actionContent.modal.description.message, {
                ...actionContent.modal.description.payload,
                event: declaration.event
              })}
          </ResponsiveModal>
        )}
      </Container>
    )
  }
}

export const ReviewAction = injectIntl(ReviewActionComponent)

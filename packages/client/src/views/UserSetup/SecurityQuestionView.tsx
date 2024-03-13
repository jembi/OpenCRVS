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
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import {
  formMessages as messages,
  buttonMessages,
  userMessages,
  QUESTION_KEYS
} from '@client/i18n/messages'
import styled from 'styled-components'
import { InputError } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { Select } from '@opencrvs/components/lib/Select'
import { find, at } from 'lodash'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData,
  ISecurityQuestionAnswer
} from '@client/components/ProtectedAccount'
import { Content } from '@opencrvs/components/lib/Content'

const EMPTY_VALUE = ''
const VISIBLE_QUESTION = 3

type IProps = {
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
} & IntlShapeProps

type IQuestion = {
  label: string
  value: string
}

type IQuestionnaire = {
  questionList: IQuestion[]
  selectedQuestion: string
  answer: string
}

type IState = {
  questionnaire: IQuestionnaire[]
  refresher: number
  showError: boolean
}

const QuestionWrapper = styled.div`
  margin-bottom: 66px;
  ${({ theme }) => theme.fonts.reg16};
`
const Wrapper = styled.div`
  display: flex;
  flex-flow: column;
  margin-bottom: 20px;
`
const Label = styled.label`
  ${({ theme }) => theme.fonts.reg18};
  margin: 0 0 6px 0;
`

const FullWidthSelect = styled(Select)`
  width: 70%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const FullWidthInput = styled(TextInput)`
  width: 70%;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const Error = styled.span`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg12};
`

class SecurityQuestionView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      questionnaire: this.prepareQuestionnaire(),
      refresher: Date.now(),
      showError: false
    }
  }

  componentDidMount = () => {
    this.removeDuplicateQuestions()
  }

  getQuestionList = (): IQuestion[] => {
    const questionKeys = Object.keys(QUESTION_KEYS)
    questionKeys.splice(0, questionKeys.length / 2)
    const result: IQuestion[] = []

    questionKeys.forEach((value: string) => {
      result.push({
        value,
        label: this.props.intl.formatMessage(userMessages[value])
      })
    })

    return result
  }

  prepareQuestionnaire = (): IQuestionnaire[] => {
    let i
    const questionnaire: IQuestionnaire[] = []
    for (i = 0; i < VISIBLE_QUESTION; i++) {
      const selectedQuestion =
        at(
          this.props,
          `setupData.securityQuestionAnswers.${i}.questionKey`
        )[0] || EMPTY_VALUE
      const selectedAnswer =
        at(this.props, `setupData.securityQuestionAnswers.${i}.answer`)[0] ||
        EMPTY_VALUE

      questionnaire.push({
        questionList: this.getQuestionList(),
        selectedQuestion: selectedQuestion,
        answer: selectedAnswer
      } as IQuestionnaire)
    }
    return questionnaire
  }

  removeDuplicateQuestions = (): void => {
    const questionnaire = this.state.questionnaire
    this.state.questionnaire.forEach(
      (iquestionnaire: IQuestionnaire, index: number) => {
        questionnaire[index].questionList = this.getQuestionList().filter(
          (question: IQuestion) => {
            return (
              iquestionnaire.selectedQuestion === question.value ||
              !find(questionnaire, { selectedQuestion: question.value })
            )
          }
        )
      }
    )

    this.setState({ questionnaire })
  }

  onQuestionSelect = (value: string, index: number): void => {
    const questionnaire = this.state.questionnaire
    questionnaire[index].selectedQuestion = value

    questionnaire.map((elem: IQuestionnaire, key: number) => {
      const answeredQuestions: IQuestion[] = []

      questionnaire.forEach((questionnaire: IQuestionnaire, nkey: number) => {
        if (
          (index === key && index === nkey) ||
          elem.selectedQuestion === questionnaire.selectedQuestion
        )
          return
        answeredQuestions.push({
          value: questionnaire.selectedQuestion,
          label: questionnaire.selectedQuestion
        })
      })

      const newQuestionList: IQuestion[] = []
      this.getQuestionList().forEach((value: IQuestion) => {
        if (find(answeredQuestions, { value: value.value })) return
        newQuestionList.push(value)
      })

      elem.questionList = newQuestionList
      return elem
    })

    this.setState(() => ({
      questionnaire,
      refresher: Date.now()
    }))
  }

  onAnswerChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const questionnaire = this.state.questionnaire
    questionnaire[index].answer = event.target.value
    this.setState({ questionnaire })
  }

  isValidate = (): boolean => {
    let isValid = true
    this.state.questionnaire.forEach((questionnaire: IQuestionnaire) => {
      if (!questionnaire.selectedQuestion || !questionnaire.answer) {
        isValid = false
        return
      }
    })
    return isValid
  }

  prepareSetupData = (): ISecurityQuestionAnswer[] => {
    return this.state.questionnaire.map((questionnaire: IQuestionnaire) => ({
      questionKey: questionnaire.selectedQuestion,
      answer: questionnaire.answer
    }))
  }

  onsubmit = (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    this.setState({ showError: true })
    this.props.setupData.securityQuestionAnswers = this.prepareSetupData()

    if (this.isValidate()) {
      this.props.goToStep(ProtectedAccoutStep.REVIEW, this.props.setupData)
    }
  }

  showQuestionnaire = () => {
    const { intl } = this.props
    return (
      <form onSubmit={this.onsubmit} key={this.state.refresher}>
        {this.state.questionnaire.map(
          (questionnaire: IQuestionnaire, index: number) => {
            return (
              <QuestionWrapper id={`question-${index}-wrapper`} key={index}>
                <Wrapper>
                  <Label>
                    {intl.formatMessage(messages.securityQuestionLabel, {
                      count: index + 1
                    })}
                    <Error>*</Error>
                  </Label>
                  <FullWidthSelect
                    id={`question-${index}`}
                    onChange={(value: string) =>
                      this.onQuestionSelect(value, index)
                    }
                    value={questionnaire.selectedQuestion}
                    options={questionnaire.questionList}
                    placeholder={intl.formatMessage(messages.select)}
                    error={
                      this.state.showError && !questionnaire.selectedQuestion
                    }
                    touched={this.state.showError}
                  />
                  {this.state.showError && !questionnaire.selectedQuestion && (
                    <InputError
                      id={`question-${index}-validation-message`}
                      centred={false}
                    >
                      {intl.formatMessage(messages.selectSecurityQuestion)}
                    </InputError>
                  )}
                </Wrapper>
                <Wrapper>
                  <Label>
                    {intl.formatMessage(messages.answer)}
                    <Error>*</Error>
                  </Label>
                  <FullWidthInput
                    id={`answer-${index}`}
                    onChange={(answer: React.ChangeEvent<HTMLInputElement>) =>
                      this.onAnswerChange(answer, index)
                    }
                    value={this.state.questionnaire[index].answer}
                    error={
                      this.state.showError &&
                      !this.state.questionnaire[index].answer
                    }
                    touched={this.state.showError}
                  />
                  {this.state.showError &&
                    !this.state.questionnaire[index].answer && (
                      <InputError
                        id={`answer-${index}-validation-message`}
                        centred={false}
                      >
                        {intl.formatMessage(messages.enterResponse)}
                      </InputError>
                    )}
                </Wrapper>
              </QuestionWrapper>
            )
          }
        )}

        <PrimaryButton id="submit-security-question" onClick={this.onsubmit}>
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
      </form>
    )
  }

  render() {
    const { intl } = this.props
    return (
      <ActionPageLight
        hideBackground
        goBack={() => {
          this.props.goToStep(
            ProtectedAccoutStep.PASSWORD,
            this.props.setupData
          )
        }}
        title={intl.formatMessage(messages.userFormSecurityQuestionsTitle)}
      >
        <Content
          title={intl.formatMessage(messages.userFormSecurityQuestionsHeading)}
          subtitle={intl.formatMessage(
            messages.userFormSecurityQuestionsDescription
          )}
          showTitleOnMobile
        >
          {this.showQuestionnaire()}
        </Content>
      </ActionPageLight>
    )
  }
}

export const SecurityQuestion = injectIntl(SecurityQuestionView)

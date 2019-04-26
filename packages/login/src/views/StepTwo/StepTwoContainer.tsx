import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { IProps, IDispatchProps, StepTwoForm } from './StepTwoForm'
import { IStoreState } from '../../store'

import * as actions from '../../login/actions'
import {
  getSubmissionError,
  getResentSMS,
  getsubmitting,
  getErrorCode
} from '../../login/selectors'

const FORM_NAME = 'STEP_TWO'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: FORM_NAME,
    submissionError: getSubmissionError(store),
    errorCode: getErrorCode(store),
    resentSMS: getResentSMS(store),
    submitting: getsubmitting(store),
    stepOneDetails: { mobile: store.login.stepOneDetails.mobile }
  }
}

const mapDispatchToProps = {
  submitAction: actions.verifyCode,
  onResendSMS: actions.resendSMS
}

const stepTwoForm = reduxForm({
  form: FORM_NAME
})(injectIntl(StepTwoForm))

export const StepTwoContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm)

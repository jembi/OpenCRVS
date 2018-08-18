import { connect } from 'react-redux'
import { addLocaleData, IntlProvider } from 'react-intl'
import * as en from 'react-intl/locale-data/en'
import * as bn from 'react-intl/locale-data/bn'
import { IntlMessages } from '../type/i18n'
import { getLanguage, getMessages } from './i18nSelectors'
import { IStoreState } from '../store'

addLocaleData([...en, ...bn])

type StateProps = {
  locale?: string
  messages: IntlMessages
}

const mapStateToProps = (store: IStoreState): StateProps => {
  return {
    locale: getLanguage(store),
    messages: getMessages(store)
  }
}

export const I18nContainer = connect<StateProps, {}>(mapStateToProps)(
  IntlProvider
)

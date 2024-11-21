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
import { PageContainer } from '@login/common/PageContainer'
import { ErrorBoundary } from '@login/ErrorBoundary'
import { IntlContainer } from '@login/i18n/components/I18nContainer'
import * as routes from '@login/navigation/routes'
import { AppStore } from '@login/store'
import { StepOneContainer } from '@login/views/StepOne/StepOneContainer'
import { getTheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { History } from 'history'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { ForgottenItem } from './views/ResetCredentialsForm/ForgottenItemForm'
import { ResetCredentialsSuccessPage } from './views/ResetCredentialsForm/ResetCredentialsSuccessPage'
import { AuthDetailsVerification } from './views/ResetCredentialsForm/AuthDetailsVerificationForm'
import { RecoveryCodeEntry } from './views/ResetCredentialsForm/RecoveryCodeEntryForm'
import { SecurityQuestion } from './views/ResetCredentialsForm/SecurityQuestionForm'
import { UpdatePassword } from './views/ResetCredentialsForm/UpdatePasswordForm'
import { Page } from './Page'
import { LoginBackgroundWrapper } from '@login/common/LoginBackgroundWrapper'
import { StepTwoContainer } from '@login/views/StepTwo/StepTwoContainer'
import { ReloadModal } from './views/ReloadModal'

interface IAppProps {
  store: AppStore
  history: History
}

// Injecting global styles for the body tag - used only once
// @ts-ignore
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`

export const App = ({ store, history }: IAppProps) => (
  <ErrorBoundary>
    <GlobalStyle />
    <Provider store={store}>
      <IntlContainer>
        <ThemeProvider theme={getTheme()}>
          <ConnectedRouter history={history}>
            <ReloadModal />
            <Page>
              <Switch>
                <Route exact path={routes.STEP_ONE}>
                  <LoginBackgroundWrapper>
                    <StepOneContainer />
                  </LoginBackgroundWrapper>
                </Route>
                <Route exact path={routes.STEP_TWO}>
                  <LoginBackgroundWrapper>
                    <StepTwoContainer />
                  </LoginBackgroundWrapper>
                </Route>
                <Route exact path={routes.FORGOTTEN_ITEM}>
                  <PageContainer>
                    <ForgottenItem />
                  </PageContainer>
                </Route>
                <Route exact path={routes.PHONE_NUMBER_VERIFICATION}>
                  <PageContainer>
                    <AuthDetailsVerification />
                  </PageContainer>
                </Route>
                <Route exact path={routes.RECOVERY_CODE_ENTRY}>
                  <PageContainer>
                    <RecoveryCodeEntry />
                  </PageContainer>
                </Route>
                <Route exact path={routes.SECURITY_QUESTION}>
                  <PageContainer>
                    <SecurityQuestion />
                  </PageContainer>
                </Route>
                <Route exact path={routes.UPDATE_PASSWORD}>
                  <PageContainer>
                    <UpdatePassword />
                  </PageContainer>
                </Route>
                <Route
                  exact
                  path={routes.SUCCESS}
                  component={ResetCredentialsSuccessPage}
                ></Route>
              </Switch>
            </Page>
          </ConnectedRouter>
        </ThemeProvider>
      </IntlContainer>
    </Provider>
  </ErrorBoundary>
)

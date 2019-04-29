import * as React from 'react'
import { connect } from 'react-redux'
import {
  InjectedIntlProps,
  injectIntl,
  InjectedIntl,
  FormattedHTMLMessage,
  defineMessages
} from 'react-intl'
import { Box } from '@opencrvs/components/lib/interface'
import styled from 'styled-components'
import { withTheme } from 'styled-components'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { getUserDetails } from 'profile/selectors'
import { getLanguage } from '/i18n/selectors'
import { IUserDetails } from 'utils/userUtils'
import { Page } from 'components/Page'
import { IStoreState } from '/store'
import { HomeViewHeader } from 'components/HomeViewHeader'

import { Legend, VerticalBar, Line } from '@opencrvs/components/lib/charts'
import { ICategoryDataPoint } from '@opencrvs/components/lib/charts/datapoint'
import { Male, Female } from '@opencrvs/components/lib/icons'

import { Query } from 'react-apollo'
import * as Sentry from '@sentry/browser'
import { Spinner } from '@opencrvs/components/lib/interface'
import { ITheme } from '@opencrvs/components/lib/theme'
import { FETCH_METRIC } from './queries'

const messages = defineMessages({
  logoutActionTitle: {
    id: 'register.home.logout',
    defaultMessage: 'Log out',
    description: 'The title for log out on an action'
  },
  hello: {
    id: 'register.home.header.hello',
    defaultMessage: 'Hello {fullName}',
    description: 'Title for the user'
  },
  FIELD_AGENT: {
    id: 'register.home.header.FIELD_AGENT',
    defaultMessage: 'Field Agent',
    description: 'The description for FIELD_AGENT role'
  },
  REGISTRATION_CLERK: {
    id: 'register.home.header.REGISTRATION_CLERK',
    defaultMessage: 'Registration Clerk',
    description: 'The description for REGISTRATION_CLERK role'
  },
  LOCAL_REGISTRAR: {
    id: 'register.home.header.LOCAL_REGISTRAR',
    defaultMessage: 'Registrar',
    description: 'The description for LOCAL_REGISTRAR role'
  },
  DISTRICT_REGISTRAR: {
    id: 'register.home.header.DISTRICT_REGISTRAR',
    defaultMessage: 'District Registrar',
    description: 'The description for DISTRICT_REGISTRAR role'
  },
  STATE_REGISTRAR: {
    id: 'register.home.header.STATE_REGISTRAR',
    defaultMessage: 'State Registrar',
    description: 'The description for STATE_REGISTRAR role'
  },
  NATIONAL_REGISTRAR: {
    id: 'register.home.header.NATIONAL_REGISTRAR',
    defaultMessage: 'National Registrar',
    description: 'The description for NATIONAL_REGISTRAR role'
  },
  birthRegistrationBoxTitle: {
    id: 'performance.graph.birthRegistrationBoxTitle',
    defaultMessage: 'Birth Registration Key Figures',
    description: 'Title for the birth registration key figures box.'
  },
  birthRegistrationBoxFooter: {
    id: 'performance.graph.birthRegistrationBoxFooter',
    defaultMessage: 'Estimates provided using National Population Census data',
    description: 'Title for the birth registration key figures box footer.'
  },
  liveBirthsWithin45DaysLabel: {
    id: 'performance.graph.liveBirthsWithin45DaysLabel',
    defaultMessage: 'Registrations within<br />45 days of birth',
    description:
      'Live births registered within 45 days of actual birth label on graph'
  },
  liveBirthsWithin45DaysDescription: {
    id: 'performance.graph.liveBirthsWithin45DaysDescription',
    defaultMessage: '142500 out of 204000',
    description:
      'Live births registered within 45 days of actual birth description on graph'
  },
  liveBirthsWithin1yearLabel: {
    id: 'performance.graph.liveBirthsWithin1yearLabel',
    defaultMessage: 'Registrations within<br />1 year of birth',
    description:
      'Live births registered within 1 year of actual birth label on graph'
  },
  liveBirthsWithin1yearDescription: {
    id: 'performance.graph.liveBirthsWithin1yearDescription',
    defaultMessage: '61500 out of 204000',
    description:
      'Live births registered within 1 year of actual birth description on graph'
  },
  totalLiveBirthsLabel: {
    id: 'performance.graph.totalLiveBirthsLabel',
    defaultMessage: 'Total Live Births registered',
    description: 'Total live births label on graph'
  },
  estimatedBirthsInTimeLabel: {
    id: 'performance.graph.estimatedBirthsInTimeLabel',
    defaultMessage: 'Estimated Births in [time period]',
    description: 'Estimated births in time period label on graph'
  },
  estimatedBirthsInTimeDescription: {
    id: 'performance.graph.estimatedBirthsInTimeDescription',
    defaultMessage: 'Provided from 2018 population census',
    description: 'Estimated births in time period description on graph'
  },
  birthRegistrationBarChartBoxTitle: {
    id: 'performance.graph.birthRegistrationBarChartBoxWithin10YearsTitle',
    defaultMessage:
      'At What Age Are Births Registered In Children Aged 0-10 Years',
    description: 'Title for birth registration bar chart box'
  },
  birthRegistrationBarChartInAgesLabel: {
    id: 'performance.graph.birthRegistrationInAgesLabel',
    defaultMessage: 'Age (years)',
    description: 'The label for x-axis of birth registration bar chart'
  },
  birthRegistrationPercentageLabel: {
    id: 'performance.graph.birthRegistrationPercentageLabel',
    defaultMessage: 'Total Births Registered (%)',
    description: 'The label for y-axis of birth registration bar chart'
  },
  birthRegistrationRateWithin45DaysBoxTitle: {
    id: 'performance.graph.birthRegistrationRateWithin45DaysTitle',
    defaultMessage: 'Birth Rate For Registrations Within 45 Days',
    description:
      'The label for birth registration rate within 45 days per month line chart box'
  },
  birthRegistrationRatePerMonthLabel: {
    id: 'performance.graph.birthRegistrationRatePerMonthLabel',
    defaultMessage: 'Calendar Month',
    description:
      'The x-axis label for birth registration rate within 45 days per month line chart'
  },
  birthRegistrationPercentageOfEstimateLabel: {
    id: 'performance.graph.birthRegistrationPercentageOfEstimateLabel',
    defaultMessage: 'Birth Registration % of estimate',
    description:
      'The y-axis label for birth registration rate within 45 days per month line chart'
  },
  genderCategoryFemaleLabel: {
    id: 'performance.graph.category.gender.female',
    defaultMessage: 'Female',
    description: 'Label for gender category Female'
  },
  genderCategoryMaleLabel: {
    id: 'performance.graph.category.gender.male',
    defaultMessage: 'Male',
    description: 'Label for gender category Male'
  },
  queryError: {
    id: 'register.workQueue.queryError',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  }
})

interface IData {
  value: number
  label: React.ReactNode
  description?: string
  total?: boolean
  estimate?: boolean
  categoricalData?: ICategoryDataPoint[]
}

const getData = (intl: InjectedIntl): IData[] => {
  return [
    {
      value: 142500,
      label: (
        <FormattedHTMLMessage
          id="graph.label1"
          defaultMessage={intl.formatHTMLMessage(
            messages.liveBirthsWithin45DaysLabel
          )}
        />
      ),
      description: intl.formatMessage(
        messages.liveBirthsWithin45DaysDescription
      ),
      categoricalData: [
        {
          name: 'female',
          label: intl.formatMessage(messages.genderCategoryFemaleLabel),
          value: 48000,
          icon: () => <Female />
        },
        {
          name: 'male',
          label: intl.formatMessage(messages.genderCategoryMaleLabel),
          value: 56000,
          icon: () => <Male />
        }
      ]
    },
    {
      value: 61500,
      label: (
        <FormattedHTMLMessage
          id="graph.label2"
          defaultMessage={intl.formatHTMLMessage(
            messages.liveBirthsWithin1yearLabel
          )}
        />
      ),
      description: intl.formatMessage(
        messages.liveBirthsWithin1yearDescription
      ),
      categoricalData: [
        {
          name: 'female',
          label: intl.formatMessage(messages.genderCategoryFemaleLabel),
          value: 48000,
          icon: () => <Female />
        },
        {
          name: 'male',
          label: intl.formatMessage(messages.genderCategoryMaleLabel),
          value: 56000,
          icon: () => <Male />
        }
      ]
    },
    {
      value: 204000,
      label: (
        <FormattedHTMLMessage
          id="graph.label3"
          defaultMessage={intl.formatHTMLMessage(messages.totalLiveBirthsLabel)}
        />
      ),
      total: true,
      categoricalData: [
        {
          name: 'female',
          label: intl.formatMessage(messages.genderCategoryFemaleLabel),
          value: 92000,
          icon: () => <Female />
        },
        {
          name: 'male',
          label: intl.formatMessage(messages.genderCategoryMaleLabel),
          value: 112000,
          icon: () => <Male />
        }
      ]
    }
  ]
}

const BoxTitle = styled.div`
  line-height: 25px;
  text-transform: capitalize !important;
  ${({ theme }) => theme.fonts.h2FontStyle}
  color: ${({ theme }) => theme.colors.primary};
`

const FooterText = styled.div`
  height: 17px;
  line-height: 17px;
  margin-top: 25px;
  ${({ theme }) => theme.fonts.infoFontStyle}
  color: ${({ theme }) => theme.colors.copy};
`

const ChartContainer = styled(Box)`
  max-width: ${({ theme }) => theme.grid.breakpoints.lg}px;
  margin: auto;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`

const Container = styled.div`
  padding: 20px 10px;
`

const LabelContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: row wrap;
  padding: 20px 0;
  color: ${({ theme }) => theme.colors.copy};
  width: 100%;
`
const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  background-color: rgba(150, 150, 150, 0.1);
  border-radius: 17px;
  padding: 5px 10px 5px 7px;
  margin: 2px 10px 2px 0;
  display: flex;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  align-items: center;
  height: 32px;
  & span {
    text-transform: uppercase;
    margin-left: 5px;
    font-size: 13px;
  }
`
interface IHomeProps {
  theme: ITheme
  language: string
  userDetails: IUserDetails
}

type FullProps = IHomeProps & InjectedIntlProps

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

class HomeView extends React.Component<FullProps> {
  render() {
    const { intl, language, userDetails, theme } = this.props
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === language
      ) as GQLHumanName
      const fullName = `${String(nameObj.firstNames)} ${String(
        nameObj.familyName
      )}`
      return (
        <Page>
          <HomeViewHeader
            title={intl.formatMessage(messages.hello, {
              fullName
            })}
            description={intl.formatMessage(
              messages[userDetails.role as string]
            )}
            id="home_view"
          />
          <Container>
            <Query
              query={FETCH_METRIC}
              variables={{
                timeStart: '1527098400000',
                timeEnd: '1556042400000'
              }}
            >
              {({ loading, error, data }) => {
                if (loading) {
                  return (
                    <StyledSpinner
                      id="search-result-spinner"
                      baseColor={theme.colors.background}
                    />
                  )
                }
                if (error) {
                  Sentry.captureException(error)
                  return (
                    <ErrorText id="search-result-error-text-review">
                      {intl.formatMessage(messages.queryError)}
                    </ErrorText>
                  )
                }

                return (
                  <>
                    <ChartContainer>
                      <BoxTitle id="box_title">
                        {intl.formatMessage(messages.birthRegistrationBoxTitle)}
                      </BoxTitle>
                      <Legend data={getData(intl)} smallestToLargest={false} />
                      <FooterText id="footer_text">
                        {intl.formatMessage(
                          messages.birthRegistrationBoxFooter
                        )}
                      </FooterText>
                    </ChartContainer>
                    <ChartContainer>
                      <BoxTitle id="bar_chart_box_title">
                        {intl.formatMessage(
                          messages.birthRegistrationBarChartBoxTitle
                        )}
                      </BoxTitle>
                      <VerticalBar
                        data={data.fetchBirthRegistrationMetrics.regByAge}
                        xAxisLabel={intl.formatMessage(
                          messages.birthRegistrationBarChartInAgesLabel
                        )}
                        yAxisLabel={intl.formatMessage(
                          messages.birthRegistrationPercentageLabel
                        )}
                      />
                    </ChartContainer>
                    <ChartContainer>
                      <BoxTitle id="line_chart_box_title">
                        {intl.formatMessage(
                          messages.birthRegistrationRateWithin45DaysBoxTitle
                        )}
                      </BoxTitle>
                      <LabelContainer>
                        <Label>2018 estimate = 10000</Label>
                      </LabelContainer>
                      <Line
                        data={data.fetchBirthRegistrationMetrics.regWithin45d}
                        xAxisLabel={intl.formatMessage(
                          messages.birthRegistrationRatePerMonthLabel
                        )}
                        yAxisLabel={intl.formatMessage(
                          messages.birthRegistrationPercentageOfEstimateLabel
                        )}
                      />
                    </ChartContainer>
                  </>
                )
              }}
            </Query>
          </Container>
        </Page>
      )
    } else {
      return <></>
    }
  }
}
const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    userDetails: getUserDetails(store)
  }
}
export const Home = connect(
  mapStateToProps,
  null
)(injectIntl(withTheme(HomeView)))

import * as React from 'react'
import {
  AppHeader,
  ExpandingMenu,
  SearchTool,
  ISearchType
} from '@opencrvs/components/lib/interface'
import {
  Hamburger,
  SearchDark,
  ApplicationBlack,
  ApplicationBlue,
  StatsBlack,
  StatsBlue,
  SettingsBlack,
  SettingsBlue,
  HelpBlack,
  HelpBlue,
  LogoutBlack,
  LogoutBlue,
  TrackingID,
  BRN,
  Phone
} from '@opencrvs/components/lib/icons'
import { LogoutConfirmation } from 'src/components/LogoutConfirmation'
import { storage } from 'src/storage'
import { SCREEN_LOCK } from 'src/components/ProtectedPage'
import { connect } from 'react-redux'
import { getUserDetails } from 'src/profile/profileSelectors'
import { IUserDetails } from '../../../utils/userUtils'
import { redirectToAuthentication } from 'src/profile/profileActions'
import { IStoreState } from 'src/store'
import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import {
  goToHome,
  goToPerformance,
  goToSearchResult,
  goToSettings
} from 'src/navigation'
import { ProfileMenu } from 'src/components/ProfileMenu'
import { TRACKING_ID_TEXT, BRN_DRN_TEXT, PHONE_TEXT } from 'src/utils/constants'

type IProps = InjectedIntlProps & {
  userDetails: IUserDetails
  redirectToAuthentication: typeof redirectToAuthentication
  language: string
  title?: string
  goToSearchResult: typeof goToSearchResult
  goToSettings: typeof goToSettings
  searchText?: string
  selectedSearchType?: string
}
interface IState {
  showMenu: boolean
  showLogoutModal: boolean
}

const messages = defineMessages({
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
  typeTrackingId: {
    id: 'register.home.header.typeTrackingId',
    defaultMessage: 'Tracking ID',
    description: 'Search menu tracking id type'
  },
  typeBrnDrn: {
    id: 'register.home.header.typeBrnDrn',
    defaultMessage: 'BRN/DRN',
    description: 'Search menu brn drn type'
  },
  typePhone: {
    id: 'register.home.header.typePhone',
    defaultMessage: 'Phone No.',
    description: 'Search menu phone no type'
  },
  placeHolderTrackingId: {
    id: 'register.home.header.placeHolderTrackingId',
    defaultMessage: 'Enter Tracking ID',
    description: 'Search menu tracking id place holder'
  },
  placeHolderBrnDrn: {
    id: 'register.home.header.placeHolderBrnDrn',
    defaultMessage: 'Enter BRN/DRN',
    description: 'Search menu brn drn place holder'
  },
  placeHolderPhone: {
    id: 'register.home.header.placeHolderPhone',
    defaultMessage: 'Enter Phone No.',
    description: 'Search menu phone no place holder'
  },
  defaultTitle: {
    id: 'register.home.header.defaultTitle',
    defaultMessage: 'Applications',
    description: 'Header default title'
  },
  applicationTitle: {
    id: 'register.home.header.applicationTitle',
    defaultMessage: 'Applications',
    description: 'Application title'
  },
  performanceTitle: {
    id: 'register.home.header.performanceTitle',
    defaultMessage: 'Performance',
    description: 'Performance title'
  }
})

class HeaderComp extends React.Component<IProps, IState> {
  state = { showMenu: false, showLogoutModal: false }

  hamburger = () => {
    const { userDetails, language, intl } = this.props

    let name = ''
    if (userDetails && userDetails.name) {
      const nameObj = userDetails.name.find(
        (storedName: GQLHumanName) => storedName.use === language
      ) as GQLHumanName
      name = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
    }

    const role =
      userDetails && userDetails.role
        ? intl.formatMessage(messages[userDetails.role])
        : ''

    const menuItems = [
      {
        icon: <ApplicationBlack />,
        iconHover: <ApplicationBlue />,
        label: 'Applications',
        onClick: goToHome
      },
      {
        icon: <StatsBlack />,
        iconHover: <StatsBlue />,
        label: 'Performance',
        onClick: goToPerformance
      },
      {
        icon: <SettingsBlack />,
        iconHover: <SettingsBlue />,
        label: 'Settings',
        onClick: this.props.goToSettings
      },
      {
        icon: <HelpBlack />,
        iconHover: <HelpBlue />,
        label: 'Help',
        onClick: () => alert('Help!')
      },
      {
        icon: <LogoutBlack />,
        iconHover: <LogoutBlue />,
        label: 'Logout',
        secondary: true,
        onClick: this.toggleLogoutModal
      }
    ]
    const userInfo = { name, role }

    return (
      <>
        <Hamburger />
        <ExpandingMenu
          menuItems={menuItems}
          userDetails={userInfo}
          showMenu={this.state.showMenu}
          menuCollapse={() => false}
        />
      </>
    )
  }

  logout = () => {
    storage.removeItem(SCREEN_LOCK)
    this.props.redirectToAuthentication()
  }

  toggleLogoutModal = () => {
    this.setState(state => ({
      showLogoutModal: !state.showLogoutModal,
      showMenu: false
    }))
  }

  toggleMenu = () => {
    this.setState(prevState => ({ showMenu: !prevState.showMenu }))
  }

  render() {
    const { intl } = this.props
    const title = this.props.title || intl.formatMessage(messages.defaultTitle)
    const menuItems = [
      {
        key: 'application',
        title: intl.formatMessage(messages.applicationTitle),
        onClick: goToHome,
        selected: true
      },
      {
        key: 'performance',
        title: intl.formatMessage(messages.performanceTitle),
        onClick: goToPerformance,
        selected: false
      }
    ]

    const searchTypeList: ISearchType[] = [
      {
        label: intl.formatMessage(messages.typeTrackingId),
        value: TRACKING_ID_TEXT,
        icon: <TrackingID />,
        placeHolderText: intl.formatMessage(messages.placeHolderTrackingId),
        isDefault: true
      },
      {
        label: intl.formatMessage(messages.typeBrnDrn),
        value: BRN_DRN_TEXT,
        icon: <BRN />,
        placeHolderText: intl.formatMessage(messages.placeHolderBrnDrn)
      },
      {
        label: intl.formatMessage(messages.typePhone),
        value: PHONE_TEXT,
        icon: <Phone />,
        placeHolderText: intl.formatMessage(messages.placeHolderPhone)
      }
    ]

    const rightMenu = [
      {
        element: (
          <SearchTool
            key="searchMenu"
            searchText={this.props.searchText}
            selectedSearchType={this.props.selectedSearchType}
            searchTypeList={searchTypeList}
            searchHandler={this.props.goToSearchResult}
          />
        )
      },
      {
        element: <ProfileMenu key="profileMenu" />
      }
    ]

    return (
      <>
        <AppHeader
          menuItems={menuItems}
          id="register_app_header"
          desktopRightMenu={rightMenu}
          left={{
            icon: () => this.hamburger(),
            handler: this.toggleMenu
          }}
          title={title}
          right={{
            icon: () => <SearchDark />,
            handler: () => {
              alert('sdfsdf')
            }
          }}
        />
        <LogoutConfirmation
          show={this.state.showLogoutModal}
          handleClose={this.toggleLogoutModal}
          handleYes={this.logout}
        />
      </>
    )
  }
}

export const Header = connect(
  (store: IStoreState) => ({
    language: store.i18n.language,
    userDetails: getUserDetails(store)
  }),
  {
    redirectToAuthentication,
    goToSearchResult,
    goToSettings
  }
)(injectIntl<IProps>(HeaderComp))

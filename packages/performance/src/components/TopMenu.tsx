import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { ArrowBack } from '@opencrvs/components/lib/icons'
import { ButtonIcon, PrimaryButton } from '@opencrvs/components/lib/buttons'
import styled from '../styled-components'
import {
  goBack as goBackAction,
  goToHome as goToHomeAction,
  goToRegister as goToRegisterAction
} from 'src/navigation'
import { redirectToAuthentication } from 'src/profile/actions'
import { getLanguages } from 'src/i18n/selectors'
import { IStoreState } from 'src/store'
import { IntlState } from 'src/i18n/reducer'
import { changeLanguage as changeLanguageAction } from 'src/i18n/actions'
import { HamburgerMenu } from '@opencrvs/components/lib/interface'
import { LogoutConfirmation } from './LogoutConfirmation'

const messages = defineMessages({
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  menu: {
    id: 'menu.menu',
    defaultMessage: 'Menu',
    description: 'Menu'
  },
  homepage: {
    id: 'menu.items.homepage',
    defaultMessage: 'Homepage',
    description: 'Menu item homepage'
  },
  register: {
    id: 'menu.items.register',
    defaultMessage: 'Register',
    description: 'Menu item register'
  },
  drafts: {
    id: 'menu.items.drafts',
    defaultMessage: 'Drafts',
    description: 'Menu item drafts'
  },
  settings: {
    id: 'menu.items.settings',
    defaultMessage: 'Settings',
    description: 'Menu item settings'
  },
  logout: {
    id: 'menu.items.logout',
    defaultMessage: 'Log out',
    description: 'Menu item logout'
  },
  changeLanguage: {
    id: 'menu.items.changeLanguage',
    defaultMessage: 'Change Language',
    description: 'Menu item changeLanguage'
  },
  english: {
    id: 'menu.items.changeLanguage.english',
    defaultMessage: 'English',
    description: 'Menu item english'
  },
  bengali: {
    id: 'menu.items.changeLanguage.bengali',
    defaultMessage: 'Bengali',
    description: 'Menu item bengali'
  }
})

const TopMenuContainer = styled.div`
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BackButtonContainer = styled.div`
  cursor: pointer;
  margin-left: ${({ theme }) => theme.grid.margin}px;
`

const BackButton = styled(PrimaryButton)`
  width: 69px;
  height: 42px;
  background: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  border-radius: 21px;
  /* stylelint-disable */
  ${ButtonIcon} {
    /* stylelint-enable */
    margin-left: 0em;
  }
`

const BackButtonText = styled.span`
  font-family: ${({ theme }) => theme.fonts.boldFont};
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 2px;
  margin-left: 14px;
`

type Props = {
  hideBackButton?: true | false | undefined | null
  goBack: typeof goBackAction
  goToHome: typeof goToHomeAction
  goToRegister: typeof goToRegisterAction
  changeLanguage: typeof changeLanguageAction
  redirectToAuthentication: typeof redirectToAuthentication
  languages: IntlState['languages']
}

interface IState {
  showLogoutModal: boolean
}
type IFullProps = Props & InjectedIntlProps

class TopMenuComponent extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps & IState) {
    super(props)
    this.state = {
      showLogoutModal: false
    }
  }

  toggleLogoutModal = () => {
    this.setState(state => ({
      showLogoutModal: !state.showLogoutModal
    }))
  }
  goToRegister = () => {
    this.props.goToRegister()
  }
  goToHome = () => {
    this.props.goToHome()
  }
  render() {
    const { intl, goBack, hideBackButton } = this.props

    const menuItems = [
      {
        title: intl.formatMessage(messages.changeLanguage),
        key: 'change-language',
        isSubMenu: true,
        menuItems: [
          {
            title: intl.formatMessage(messages.english),
            key: 'english',
            onClick: this.props.changeLanguage.bind(null, { language: 'en' })
          },
          {
            title: intl.formatMessage(messages.bengali),
            key: 'bengali',
            onClick: this.props.changeLanguage.bind(null, { language: 'bn' })
          }
        ]
      },
      {
        title: intl.formatMessage(messages.homepage),
        key: 'homepage',
        onClick: this.goToHome
      },
      {
        title: intl.formatMessage(messages.register),
        key: 'register',
        onClick: this.goToRegister
      },
      {
        title: intl.formatMessage(messages.settings),
        key: 'settings'
      },
      {
        title: intl.formatMessage(messages.logout),
        key: 'logout',
        onClick: this.toggleLogoutModal
      }
    ]

    return (
      <TopMenuContainer id="top-menu-container">
        {!hideBackButton && (
          <BackButtonContainer onClick={goBack}>
            <BackButton icon={() => <ArrowBack />} />
            <BackButtonText>{intl.formatMessage(messages.back)}</BackButtonText>
          </BackButtonContainer>
        )}
        <HamburgerMenu
          menuItems={menuItems}
          menuTitle={intl.formatMessage(messages.menu)}
        />
        <LogoutConfirmation
          show={this.state.showLogoutModal}
          handleClose={this.toggleLogoutModal}
          handleYes={this.props.redirectToAuthentication}
        />
      </TopMenuContainer>
    )
  }
}

export const TopMenu = connect(
  (state: IStoreState) => ({
    languages: getLanguages(state),
    language: state.i18n.language
  }),
  {
    goToHome: goToHomeAction,
    goToRegister: goToRegisterAction,
    goBack: goBackAction,
    changeLanguage: changeLanguageAction,
    redirectToAuthentication
  }
)(injectIntl<IFullProps>(TopMenuComponent))

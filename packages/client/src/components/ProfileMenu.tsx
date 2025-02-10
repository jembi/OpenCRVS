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
import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import {
  injectIntl,
  WrappedComponentProps as IntlShapeProps,
  IntlShape
} from 'react-intl'
import {
  IToggleMenuItem,
  ToggleMenu
} from '@opencrvs/components/lib/ToggleMenu'
import { Icon } from '@opencrvs/components/lib/Icon'
import { AvatarSmall } from '@client/components/Avatar'
import { IStoreState } from '@client/store'
import { UserDetails, getIndividualNameObj } from '@client/utils/userUtils'
import { getLanguage } from '@client/i18n/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { redirectToAuthentication } from '@client/profile/profileActions'
import { buttonMessages } from '@client/i18n/messages'
import { useNavigate } from 'react-router-dom'
import * as routes from '@client/navigation/routes'

const UserName = styled(Text)`
  margin-bottom: 6px;
`

const UserRole = styled(Text)`
  margin-bottom: 6px;
`

interface IProps {
  language: string
  userDetails: UserDetails | null
  redirectToAuthentication: typeof redirectToAuthentication
}

type FullProps = IProps & IntlShapeProps

const ProfileMenuComponent = ({
  intl,
  language,
  userDetails,
  redirectToAuthentication
}: FullProps) => {
  const navigate = useNavigate()

  const getMenuItems = (intl: IntlShape): IToggleMenuItem[] => {
    const items = [] as IToggleMenuItem[]
    items.push({
      icon: <Icon name="Gear" size="small" />,
      label: intl.formatMessage(buttonMessages.settings),
      handler: () => navigate(routes.SETTINGS)
    })
    items.push({
      icon: <Icon name="SignOut" size="small" />,
      label: intl.formatMessage(buttonMessages.logout),
      handler: () => redirectToAuthentication()
    })
    return items
  }

  const getUserName = (
    language: string,
    userDetails: UserDetails | null
  ): string => {
    let userName = ''

    if (userDetails && userDetails.name) {
      const nameObj = getIndividualNameObj(userDetails.name, language)

      if (nameObj) {
        userName = `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      }
    }

    return userName
  }

  const getMenuHeader = (
    language: string,
    userDetails: UserDetails | null
  ): JSX.Element => {
    const userName = getUserName(language, userDetails)

    return (
      <>
        <UserName element="p" variant="h4">
          {userName}
        </UserName>
        <UserRole element="p" variant="h4">
          {userDetails && intl.formatMessage(userDetails.role.label)}
        </UserRole>
      </>
    )
  }

  return (
    <>
      <ToggleMenu
        id="ProfileMenu"
        toggleButton={
          <AvatarSmall
            name={getUserName(language, userDetails)}
            avatar={userDetails?.avatar}
          />
        }
        menuHeader={getMenuHeader(language, userDetails)}
        menuItems={getMenuItems(intl)}
      />
    </>
  )
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store),
    userDetails: getUserDetails(store)
  }
}

export const ProfileMenu = connect(mapStateToProps, {
  redirectToAuthentication
})(injectIntl(ProfileMenuComponent))

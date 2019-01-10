import * as React from 'react'
import { Online, Offline } from '@opencrvs/components/lib/icons'
import styled from 'src/styled-components'

const StyledOnline = styled.div`
  position: absolute;
  top: 32px;
  right: 210px;
`

const StyledOffline = styled.div`
  position: absolute;
  top: 32px;
  right: 210px;
`

const ConnectivityStatus = () => {
  return navigator.onLine ? (
    <StyledOnline>
      <Online />
    </StyledOnline>
  ) : (
    <StyledOffline>
      <Offline />
    </StyledOffline>
  )
}

export default ConnectivityStatus

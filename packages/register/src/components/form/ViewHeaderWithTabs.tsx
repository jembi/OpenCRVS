import { Tabs } from '@opencrvs/components/lib/interface'
import styled from 'styledComponents'
import { ViewHeader } from '../ViewHeader'

export const ViewHeaderWithTabs = styled(ViewHeader)`
  padding-bottom: 0;

  #informant_parent_view {
    min-height: 107px;
  }

  #informant_parent_view > h2 {
    margin-top: 12px;
  }

  /* stylelint-disable */
  ${Tabs} {
    /* stylelint-enable */
    overflow-x: auto;
    width: 100%;
  }
`

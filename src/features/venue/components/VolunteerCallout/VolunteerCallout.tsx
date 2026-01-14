import React, { FunctionComponent, useState } from 'react'
import styled from 'styled-components/native'

import { VolunteerInterestFeedback } from 'features/venue/components/VolunteerCallout/VolunteerInterestFeedback'
import { analytics } from 'libs/analytics'
import { Banner } from 'ui/designSystem/Banner/Banner'
import { BannerType } from 'ui/designSystem/Banner/enums'
import { Bulb } from 'ui/svg/icons/Bulb'

const JEVEUXAIDER_URL = 'https://jeveuxaider.gouv.fr'

type VolunteerCalloutProps = {
  venueId: number
  venueName: string
  volunteerUrl?: string
  showInterestFeedback?: boolean
}

export const VolunteerCallout: FunctionComponent<VolunteerCalloutProps> = ({
  venueId,
  venueName,
  volunteerUrl = JEVEUXAIDER_URL,
  showInterestFeedback = false,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const handleLinkPress = () => {
    analytics.logVolunteerCalloutClick({ venueId, venueName })
  }

  const handleClose = () => {
    setIsVisible(false)
    analytics.logVolunteerCalloutClose({ venueId, venueName })
  }

  if (!isVisible) return null

  return (
    <Container>
      <Banner
        type={BannerType.INFO}
        Icon={Bulb}
        label="Wahou ce partenaire propose du bénévolat !"
        description="Découvre les opportunités de bénévolat disponibles"
        links={[
          {
            wording: 'En savoir plus',
            externalNav: { url: volunteerUrl },
            onBeforeNavigate: handleLinkPress,
          },
        ]}
        onClose={handleClose}
        testID="volunteer-callout"
      />
      {showInterestFeedback ? (
        <VolunteerInterestFeedback venueId={venueId} venueName={venueName} />
      ) : null}
    </Container>
  )
}

const Container = styled.View(({ theme }) => ({
  marginBottom: theme.designSystem.size.spacing.m,
}))

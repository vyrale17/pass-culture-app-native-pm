import React, { FunctionComponent, useState } from 'react'
import styled from 'styled-components/native'

import { analytics } from 'libs/analytics'
import { ButtonTertiaryPrimary } from 'ui/components/buttons/ButtonTertiaryPrimary'
import { ButtonTertiarySecondary } from 'ui/components/buttons/ButtonTertiarySecondary'
import { ViewGap } from 'ui/components/ViewGap/ViewGap'
import { Typo } from 'ui/theme'

type VolunteerInterestFeedbackProps = {
  venueId: number
  venueName: string
}

export const VolunteerInterestFeedback: FunctionComponent<VolunteerInterestFeedbackProps> = ({
  venueId,
  venueName,
}) => {
  const [hasAnswered, setHasAnswered] = useState(false)

  const handleFeedback = (isInterested: boolean) => {
    analytics.logVolunteerInterestFeedback({ venueId, venueName, isInterested })
    setHasAnswered(true)
  }

  if (hasAnswered) {
    return (
      <Container>
        <Typo.BodyS>Merci pour ton retour !</Typo.BodyS>
      </Container>
    )
  }

  return (
    <Container>
      <QuestionText>Est-ce que ça t'intéresse ?</QuestionText>
      <ButtonsContainer gap={3}>
        <StyledButtonTertiaryPrimary
          wording="Ça m'intéresse"
          onPress={() => handleFeedback(true)}
        />
        <StyledButtonTertiarySecondary
          wording="Pas pour moi"
          onPress={() => handleFeedback(false)}
        />
      </ButtonsContainer>
    </Container>
  )
}

const Container = styled.View(({ theme }) => ({
  marginTop: theme.designSystem.size.spacing.m,
  gap: theme.designSystem.size.spacing.s,
}))

const QuestionText = styled(Typo.BodyAccentS)(({ theme }) => ({
  color: theme.designSystem.color.text.title,
}))

const ButtonsContainer = styled(ViewGap)({
  flexDirection: 'row',
  flexWrap: 'wrap',
})

const StyledButtonTertiaryPrimary = styled(ButtonTertiaryPrimary)({
  flex: 0,
})

const StyledButtonTertiarySecondary = styled(ButtonTertiarySecondary)({
  flex: 0,
})

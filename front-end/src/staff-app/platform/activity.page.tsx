import React, { useEffect } from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Colors } from "shared/styles/colors"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { RollListTile } from "staff-app/components/roll-list-tile/roll-list-tile.component"

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" });

  useEffect(() => {
    void getActivities();
  }, [getActivities]);

  console.log(data);

  return (
    <>
  <S.Container>
      <Toolbar/>
      {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}
      {loadState === "loaded" && (
          <>
            {data?.activity.map((s) => (
              <RollListTile entity={s?.entity}/>
            ))}
          </>
        )}
      {loadState === "loaded" && data?.activity?.length === 0 &&(
          <div className="noResults">
          No results to display
          </div>
        )}
      {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
  </S.Container>
  </>
)}

const Toolbar: React.FC = () => {
  return (
    <S.ToolbarContainer>
      <div>Name</div>
      <div>Roll State</div>
    </S.ToolbarContainer>
  )
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 50px;
  `,
  ToolbarContainer: styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  background-color: ${Colors.blue.base};
  padding: 14px 14px;
  font-weight: ${FontWeight.strong};
  border-radius: ${BorderRadius.default};
`
}

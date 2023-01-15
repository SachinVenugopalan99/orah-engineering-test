import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { ItemType } from "shared/models/roll"
import { debounce } from "utils/custom-hook"
import { Images } from "assets/images";
import './styles.scss';

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false);
  const [isFirstName, setIsFirstName] = useState(true);
  const [studentList, setStudentList] = useState<Person[]>([]);
  const [renderList, setRenderList] = useState<Person[]>([]);
  const [isSortAsc, setIsSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rollType, setRollType] = useState('all')
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" });
  const [callSavedStudent, result, isLoading] = useApi<{ }>({ url: "save-roll" });

  const debouncedSearhTerm = debounce(searchTerm, 250);

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
   if (data?.students) {
    const arr = []
    for (let i = 0; i < data?.students?.length; i++){
        const item = {...data.students[i], full_name: data.students[i].first_name + data.students[i].last_name, role: 'unmark' }
        arr.push(item);
    }
    setStudentList(arr);
    setRenderList(arr);
   }
  }, [data?.students]);

  useEffect(() => {
    if (debouncedSearhTerm) {
        const result = renderList?.filter((item) => item?.full_name?.toLowerCase()?.includes(debouncedSearhTerm?.toLowerCase()));
        setStudentList(getSortedResults(isFirstName, isSortAsc, result, rollType));
    } else {
      setStudentList(getSortedResults(isFirstName, isSortAsc, renderList, rollType));
    }

}, [debouncedSearhTerm]);

  const getSortedResults = (firstName: boolean, sortAsc: boolean, list: Person[], type: string): Person[] => {
    switch(firstName){
      case true:
      if (sortAsc) {
        return list.filter((item) => type === 'all' ? item: item.role === type).sort((a: Person, b: Person) => a.first_name.localeCompare(b.first_name));
      } else {
        return list.filter((item) => type === 'all' ? item: item.role === type).sort((a: Person, b: Person) => b.first_name.localeCompare(a.first_name));
      }
      case false:
        if (sortAsc) {
          return list.filter((item) => type === 'all' ? item: item.role === type).sort((a: Person, b: Person) => a.last_name.localeCompare(b.last_name));
      } else {
        return list.filter((item) => type === 'all' ? item: item.role === type).sort((a: Person, b: Person) => b.last_name.localeCompare(a.last_name));
      }
      default:
        return []; 
    }
  }

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
    if (action === 'name') {
      const results: Person[] = getSortedResults(!isFirstName, isSortAsc, studentList, rollType);
      setStudentList(results); 
      setIsFirstName(!isFirstName)
    }
    if (action === 'sort') {
    const results: Person[] = getSortedResults(isFirstName, !isSortAsc, studentList, rollType);
    setStudentList(results); 
    setIsSortAsc(!isSortAsc);
    }
  };

  const saveRolls = () => {
    const temp = [];
    for (let i = 0; i < renderList?.length; i++) {
     const arr = {student_id: renderList[i]?.id, roll_state: renderList[i]?.role}
     temp.push(arr);
    }
    callSavedStudent({student_roll_states: temp})
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "save") {
      saveRolls()
    }
    setIsRollMode(false);
    setRollType('all');
  }
  const getRoll = (roleType: string, id: number) => {
  const tempList = [...studentList];
  const newList = [...renderList];
  const index = tempList?.findIndex((item) => item?.id === id);
  const ind = newList?.findIndex((item) => item?.id === id);
  if (index > -1) {
    const temp = {...tempList[index], role: roleType};
    tempList?.splice(index, 1, temp);
    setStudentList(tempList);
  }
  if (ind > -1) {
    const arr = {...newList[ind], role: roleType};
    newList?.splice(ind, 1, arr);
    setRenderList(newList);
  }
  }

  const searchValue = (value: string) =>{
    setSearchTerm(value);
  }

  const onRoleClick = (type: ItemType) => {
    let result = [];
    if (debouncedSearhTerm) {
      result = renderList?.filter((item) => item?.full_name?.toLowerCase()?.includes(debouncedSearhTerm?.toLowerCase()));
    } else {
      result = [...renderList];
    }
    const results: Person[] = getSortedResults(isFirstName, isSortAsc, result, type);
    setStudentList(results); 
    setRollType(type);
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} 
        isFirstName={isFirstName}
        searchValue={searchValue}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && (
          <>
            {studentList.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} getRoll={getRoll}/>
            ))}
          </>
        )}
        {loadState === "loaded" && studentList?.length === 0 &&(
          <div className="noResults">
          No results to display
          </div>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay 
      isActive={isRollMode} 
      onItemClick={onActiveRollAction} 
      students={renderList} 
      total={renderList?.length} 
      onRoleClick={onRoleClick} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | 'name'
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void,
  isFirstName: boolean,
  searchValue:(value: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, isFirstName, searchValue } = props
  return (
    <S.ToolbarContainer>
      <div className="nameContainer" onClick={(e) => onItemClick('name')}>{isFirstName ? 'First Name' : 'Last Name'}
      <img
      className="sortIcon"
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        onItemClick("sort")}} 
      src={Images.sort}
      width={16}
      height={16}
      />
      </div>
      <S.Input 
      type='text' 
      placeholder="Search"
      onChange={(e) => searchValue(e.target.value)}
      />
      <S.Button onClick={(e) => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    cursor: pointer;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Input: styled.input`
  padding: 0.5em;
  margin: 0.5em;
  background: papayawhip;
  border: none;
  border-radius: 3px;
`,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}

import { useState, FC } from 'react';
import { Input, Checkbox, Flex} from 'antd';
import { EditFilled, SaveOutlined } from '@ant-design/icons';

interface TodoItemProps {
  initChecked: boolean
  description: string
}

function TodoItem({initChecked, description}: TodoItemProps) {
    const [isChecked, setIsChecked] = useState<boolean>(initChecked)
    const [todoValue, setTodoValue] = useState<string>(description)
    const [editing, setEditing] = useState<boolean>(false)
    const [isHovered, setIsHovered] = useState<boolean>(false)

    const EditingIcon: FC = () => <a key="todo-edit" onClick={() => {
            console.log(`Editing ${todoValue}`)
            setEditing(!editing)
        }}>{editing ? <SaveOutlined /> : <EditFilled />}</a>

    return (
        <>
            <Flex onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)} justify="space-between" style={{ width: "100%" }}>
                <Checkbox checked={isChecked} onChange={(e => {console.log(`checkbox ${todoValue} state: ${e.target.checked}`); setIsChecked(e.target.checked)})}>
                    { editing ? <Input defaultValue={todoValue} onChange={(e) => setTodoValue(e.target.value)} /> : todoValue }
                </Checkbox>
                { isHovered && <EditingIcon /> }
            </Flex>
        </>
    )
}

TodoItem.defaultProps = {
  initChecked: false
};


export { TodoItem }

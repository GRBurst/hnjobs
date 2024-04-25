import { useState, FC } from 'react';
import { Input, Checkbox, Flex} from 'antd';
import type { CheckboxProps } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { EditFilled, SaveOutlined } from '@ant-design/icons';

interface TodoItemProps {
  initChecked: boolean
  description: string
}

function TodoItem({initChecked, description}: TodoItemProps) {
    const [isChecked, setIsChecked] = useState<boolean>(initChecked)
    const [todoValue, setTodoValue] = useState<string>(description)
    const [isEditing, setEditing] = useState<boolean>(false)
    const [isHovered, setIsHovered] = useState<boolean>(false)

    const EditingIcon: FC = () => <a key="todo-edit" onClick={() => {
            console.log(`Editing ${todoValue}`)
            setEditing(!isEditing)
    }}>
        { isEditing ? <SaveOutlined /> : <EditFilled /> }
    </a>

    const handleCheckbox: CheckboxProps['onChange'] = (e: CheckboxChangeEvent): void => {
        console.log(`checkbox ${todoValue} state: ${e.target.checked}`)
        setIsChecked(e.target.checked)
    }

    return (
        <Flex className="my-1 h-4" onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)} align="center" justify="space-between" style={{ width: "100%" }}>
            <Checkbox checked={isChecked} onChange={handleCheckbox}>
                { isEditing ? <Input defaultValue={todoValue} onChange={(e) => setTodoValue(e.target.value)} /> : todoValue }
            </Checkbox>
            { isHovered && <EditingIcon /> }
        </Flex>
    )
}

TodoItem.defaultProps = {
  initChecked: false
};


export { TodoItem }

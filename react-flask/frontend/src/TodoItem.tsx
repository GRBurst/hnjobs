import { useState } from 'react';
import { Checkbox } from 'antd';

interface TodoItemProps {
  initChecked: boolean
  description: string
}

function TodoItem({initChecked, description}: TodoItemProps) {
    const [isChecked, setIsChecked] = useState<boolean>(initChecked)

    return (
        <>
            <div>
                <Checkbox checked={isChecked} onChange={(e => {console.log(`checkbox ${description} state: ${e.target.checked}`); setIsChecked(e.target.checked)})}>{description}</Checkbox>
            </div>
        </>
    )
}

TodoItem.defaultProps = {
  initChecked: false
};


export { TodoItem }

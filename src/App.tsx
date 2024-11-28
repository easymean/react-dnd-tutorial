import { useState } from 'react';
import './App.css';
import { DragItem } from './DragItem';
import { DropArea } from './DropArea';

function App() {
  const [list, setList] = useState<string[]>([]);
  const addList = () => {
    const randomId = crypto.randomUUID();
    const newList = [...list, randomId];
    setList(newList);
  };

  const deleteList = (id: string) => {
    const newList = [...list.filter((el) => el !== id)];
    setList(newList);
  };
  return (
    <>
      <button onClick={() => addList()}>리스트 추가하기</button>
      <div>
        <DropArea>
          {list.map((el, idx) => (
            <DragItem key={el} id={el}>
              <div
                style={{
                  width: '100px',
                  height: '50px',
                  border: '1px dashed black',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '5px 0',
                }}
              >
                <button draggable='true'>drag</button>
                <span>{idx}</span>
                <button onClick={() => deleteList(el)}>X</button>
              </div>
            </DragItem>
          ))}
        </DropArea>
      </div>
    </>
  );
}

export default App;

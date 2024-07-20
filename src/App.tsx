import { useState } from "react";
import "./App.css";
import { DragItem } from "./DragItem";
import { DropArea } from "./DropArea";

function App() {
  const [list, setList] = useState<string[]>([]);
  const addList = () => {
    const randomId = list.length.toString();
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
                  width: "100px",
                  border: "1px solid red",
                  display: "flex",
                }}
              >
                <button draggable="true">drag</button>
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

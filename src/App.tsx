import "./App.css";
import { DragItem } from "./DragItem";
import { DropArea } from "./DropArea";

function App() {
  const list = [0, 1, 2, 3, 4];
  return (
    <>
      <div>
        <DropArea>
          {list.map((el, idx) => (
            <DragItem key={idx} id={idx.toString()}>
              <div style={{ width: "100px", border: "1px solid red" }}>
                <button draggable="true">{el}</button>
                <span>{el}</span>
              </div>
            </DragItem>
          ))}
        </DropArea>
      </div>
    </>
  );
}

export default App;

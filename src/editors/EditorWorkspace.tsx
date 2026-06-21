import { SourceStage } from '../components/SourceStage';
import { StickerResults } from '../components/StickerResults';
import { Timeline } from '../components/Timeline';
import { ValidationPanel } from '../components/ValidationPanel';

interface Props { onUpload: (file: File) => void; onSlice: () => void; onSample: () => void; busy: boolean }
export function EditorWorkspace(props: Props) {
  return <>
    <div className="editor-grid"><SourceStage {...props} /><StickerResults /></div>
    <Timeline />
    <ValidationPanel />
  </>;
}

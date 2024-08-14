import { useEffect, useContext, useCallback } from 'react';
import { GoTrash, GoFile } from 'react-icons/go';
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableColumn,
  Button,
} from '@nextui-org/react';
import { deleteFile, lsFiles } from '@/actions/upload';
import { Dirent } from 'fs';
import { ScriptContext } from '@/contexts/script';
import path from 'path';

interface FilesProps {
  files: Dirent[];
  setFiles: React.Dispatch<React.SetStateAction<Dirent[]>>;
}

const Files: React.FC<FilesProps> = ({ files, setFiles }) => {
  useEffect(() => fetchFiles(), []);
  const { workspace } = useContext(ScriptContext);

  const fetchFiles = useCallback(() => {
    lsFiles(workspace)
      .then((data: string) => setFiles(JSON.parse(data) as Dirent[]))
      .catch((error) => console.error('Error fetching files:', error));
  }, [workspace]);

  return (
    <Table removeWrapper aria-label="files">
      <TableHeader>
        <TableColumn>File</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.name}>
            <TableCell className="w-[90%]">{file.name}</TableCell>
            <TableCell>
              <div className="flex space-x-4">
                <Button
                  startContent={<GoFile />}
                  isIconOnly
                  color="primary"
                  radius="full"
                  onPress={async () =>
                    window.alert(
                      'Coming soon, we promise! This will open your file.'
                    )
                  }
                />
                <Button
                  startContent={<GoTrash />}
                  isIconOnly
                  color="danger"
                  radius="full"
                  onPress={async () => {
                    deleteFile(path.join(file.path, file.name))
                      .catch((error) =>
                        console.error('Error deleting file:', error)
                      )
                      .finally(() => fetchFiles());
                  }}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Files;

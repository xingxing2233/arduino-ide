import { inject, injectable } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { notEmpty } from '@theia/core/lib/common/objects';
import { FileSystem } from '@theia/filesystem/lib/common';
import { MessageService } from '@theia/core/lib/common/message-service';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { Sketch, SketchesService } from '../../common/protocol';

@injectable()
export class SketchesServiceClientImpl {

    @inject(FileSystem)
    protected readonly fileSystem: FileSystem;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(SketchesService)
    protected readonly sketchService: SketchesService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    async currentSketch(): Promise<Sketch | undefined> {
        const sketches = (await Promise.all(this.workspaceService.tryGetRoots().map(({ uri }) => this.sketchService.getSketchFolder(uri)))).filter(notEmpty);
        if (!sketches.length) {
            return undefined;
        }
        if (sketches.length > 1) {
            console.log(`Multiple sketch folders were found in the workspace. Falling back to the first one. Sketch folders: ${JSON.stringify(sketches)}`);
        }
        return sketches[0];
    }

    async currentSketchFile(): Promise<string | undefined> {
        const sketch = await this.currentSketch();
        if (sketch) {
            const uri = new URI(sketch.uri).resolve(`${sketch.name}.ino`).toString();
            const exists = await this.fileSystem.exists(uri);
            if (!exists) {
                this.messageService.warn(`Could not find sketch file: ${uri}`);
                return undefined;
            }
            return uri;
        }
        return undefined;
    }

}

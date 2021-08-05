import * as React from 'react';
import { inject, injectable, postConstruct } from 'inversify';
import { AbstractDialog, DialogProps } from '@theia/core/lib/browser/dialogs';
import { Widget } from '@phosphor/widgets';
import { Message } from '@phosphor/messaging';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import {
  AvailableBoard,
  BoardsServiceProvider,
} from '../../boards/boards-service-provider';
import {
  ArduinoFirmwareUploader,
  FirmwareInfo,
} from '../../../common/protocol/arduino-firmware-uploader';
import { FirmwareUploaderComponent } from './firmware-uploader-component';
import { UploadFirmware } from '../../contributions/upload-firmware';

@injectable()
export class UploadFirmwareDialogWidget extends ReactWidget {
  @inject(BoardsServiceProvider)
  protected readonly boardsServiceClient: BoardsServiceProvider;

  @inject(ArduinoFirmwareUploader)
  protected readonly arduinoFirmwareUploader: ArduinoFirmwareUploader;

  protected updatableFqbns: string[] = [];
  protected availableBoards: AvailableBoard[] = [];

  public busyCallback = (busy: boolean) => {
    return;
  };

  constructor() {
    super();
  }

  @postConstruct()
  protected init(): void {
    this.arduinoFirmwareUploader.updatableBoards().then((fqbns) => {
      this.updatableFqbns = fqbns;
      this.update();
    });

    this.boardsServiceClient.onAvailableBoardsChanged((availableBoards) => {
      this.availableBoards = availableBoards;
      this.update();
    });
  }

  protected flashFirmware(firmware: FirmwareInfo, port: string): Promise<any> {
    this.busyCallback(true);
    return this.arduinoFirmwareUploader
      .flash(firmware, port)
      .finally(() => this.busyCallback(false));
  }

  protected render(): React.ReactNode {
    return (
      <form>
        <FirmwareUploaderComponent
          availableBoards={this.availableBoards}
          firmwareUploader={this.arduinoFirmwareUploader}
          flashFirmware={this.flashFirmware.bind(this)}
          updatableFqbns={this.updatableFqbns}
        />
      </form>
    );
  }
}

@injectable()
export class UploadFirmwareDialogProps extends DialogProps {}

@injectable()
export class UploadFirmwareDialog extends AbstractDialog<void> {
  @inject(UploadFirmwareDialogWidget)
  protected readonly widget: UploadFirmwareDialogWidget;

  private busy = false;

  constructor(
    @inject(UploadFirmwareDialogProps)
    protected readonly props: UploadFirmwareDialogProps
  ) {
    super({ title: UploadFirmware.Commands.OPEN.label || '' });
    this.contentNode.classList.add('firmware-uploader-dialog');
    this.acceptButton = undefined;
  }

  get value(): void {
    return;
  }

  protected onAfterAttach(msg: Message): void {
    if (this.widget.isAttached) {
      Widget.detach(this.widget);
    }
    Widget.attach(this.widget, this.contentNode);
    this.widget.busyCallback = this.busyCallback.bind(this);
    super.onAfterAttach(msg);
    this.update();
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.widget.update();
  }

  protected onActivateRequest(msg: Message): void {
    super.onActivateRequest(msg);
    this.widget.activate();
  }

  protected handleEnter(event: KeyboardEvent): boolean | void {
    return false;
  }

  close(): void {
    if (this.busy) {
      return;
    }
    super.close();
  }

  busyCallback(busy: boolean): void {
    this.busy = busy;
    if (busy) {
      this.closeCrossNode.classList.add('disabled');
    } else {
      this.closeCrossNode.classList.remove('disabled');
    }
  }
}

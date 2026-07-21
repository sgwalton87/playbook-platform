import { PlaybookRecord } from "../playbook-record";

export interface PlaybookRecordRepository {

  load(id:string):Promise<PlaybookRecord>;

  save(record:PlaybookRecord):Promise<void>;

  update(record:PlaybookRecord):Promise<void>;

}

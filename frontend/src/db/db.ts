// db.js
import Dexie from 'dexie';


type Draft = {
    id: string;
    content: string;
}

const db = new Dexie('refined') as Dexie & {
    drafts: Dexie.Table<Draft, string>;
};
db.version(1).stores({
    drafts: 'id',
});

export type { Draft };
export { db };
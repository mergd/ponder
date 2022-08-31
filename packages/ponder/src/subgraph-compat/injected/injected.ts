// The purpose of this file is to generate a `injected.js` file in the user's repo at ~/project/.ponder/injected.js
// This file is injected while building the user's handlers.js file.

import { Entity, ValueKind } from "@ponder/graph-ts-ponder";

// The db gets injected into the global scope before handler functions start running.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const db = global.db;

type GraphStore = {
  get: (entity: string, id: string) => Entity | null;
  set: (entity: string, id: string, data: Entity) => void;
  remove: (entity: string, id: string) => void;
};

const get = (entityName: string, id: string) => {
  console.log("in get with:", { entityName, id });

  const entity = db
    .prepare(`select * from \`${entityName}\` where id = '@id'`)
    .get({ id: id });

  console.log("returning entity:", { entity });

  if (!entity) {
    return null;
  }

  return entity;
};

const set = async (entityName: string, id: string, entity: Entity) => {
  console.log("in set with:", { entityName, id });

  const columnStatements = entity.entries.map((entry) => {
    switch (entry.value.kind) {
      case ValueKind.STRING: {
        return {
          column: `\`${entry.key}\``,
          value: `'${entry.value.data}'`,
        };
      }
      case ValueKind.INT: {
        return {
          column: `\`${entry.key}\``,
          value: `${entry.value.data}`,
        };
      }
      case ValueKind.BIGDECIMAL: {
        return {
          column: `\`${entry.key}\``,
          value: `${entry.value.data}`,
        };
      }
      case ValueKind.BOOL: {
        return {
          column: `\`${entry.key}\``,
          value: `${entry.value.data ? "true" : "false"}`,
        };
      }
      case ValueKind.ARRAY: {
        throw new Error(`Unhandled ValueKind: ARRAY`);
      }
      case ValueKind.NULL: {
        return {
          column: `\`${entry.key}\``,
          value: `null`,
        };
      }
      case ValueKind.BYTES: {
        return {
          column: `\`${entry.key}\``,
          value: `'${entry.value.data?.toString()}'`,
        };
      }
      case ValueKind.BIGINT: {
        return {
          column: `\`${entry.key}\``,
          value: `'${entry.value.data?.toString()}'`,
        };
      }
    }
  });

  const insertFragment = `(${columnStatements
    .map((s) => s.column)
    .join(", ")}) values (${columnStatements.map((s) => s.value).join(", ")})`;

  const updateFragment = columnStatements
    .filter((s) => s.column !== "id")
    .map((s) => `${s.column}=excluded.${s.column}`)
    .join(", ");

  const statement = `insert into \`${entityName}\` ${insertFragment} on conflict(\`id\`) do update set ${updateFragment}`;

  db.prepare(statement).run();
};

const remove = (entityName: string, id: string) => {
  console.log("in remove with:", { entityName, id });

  const statement = `delete from \`${entityName}\` where \`id\` = '${id}'`;

  db.prepare(statement).run();
};

export const ponderInjectedStore: GraphStore = { get, set, remove };

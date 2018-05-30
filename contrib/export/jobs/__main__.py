#!/usr/bin/python3
import os
import logging
import asyncio
import concurrent.futures
from datetime import datetime
# import gzip
import psycopg2


db = psycopg2.connect(
    dbname='geonaturedb', host='localhost',
    user='geonatuser', password='monpassachanger')
exports_path='/home/pat/geonature/backend/static/exports/export_{id}.{ext}'
selector = "COPY (SELECT {} FROM gn_intero.v_export) TO STDOUT WITH CSV HEADER DELIMITER ',';"
num_workers = max(1, len(os.sched_getaffinity(0)) - 1)

queue = asyncio.Queue(maxsize=0)

asyncio_logger = logging.getLogger('asyncio')
asyncio_logger.setLevel(logging.DEBUG)
console_logger = logging.StreamHandler()
asyncio_logger.addHandler(console_logger)
loop = asyncio.get_event_loop()
loop.set_debug = True


def export_csv(id, columns):
    c = db.cursor()
    statement = selector.format(', '.join(['"{}"'.format(column) for column in columns]))
    now = datetime.utcnow()
    # with gzip.open
    with open(exports_path.format(id=id, ext='csv'), 'wb') as export:
        c.execute('UPDATE gn_intero.t_exports SET start=NOW() WHERE submission=%s', (id,))
        try:
            c.copy_expert(statement, export)
            c.execute('UPDATE gn_intero.t_exports SET (end, log, status)=(NOW(), %s, %s) WHERE submission=%s',
                      (c.rowcount, 0, id))
        except Exception as e:
            c.execute('UPDATE gn_intero.t_exports SET (end, log, status)=(NULL, %s, -1) WHERE submission=%s',
                      (str(e), id))
        finally:
            db.commit()


async def process(queue=queue, loop=loop):
    with concurrent.futures.ProcessPoolExecutor() as executor:
        if queue.empty():
            return None
        task = await queue.get()
        func = task['func']
        args = [*task['args']]
        return loop.run_in_executor(executor, func, *args)


async def run(queue=queue, num_workers=num_workers):
    while not queue.empty():
        tasks = [process(queue) for i in range(num_workers)]
        for future in asyncio.as_completed(tasks):
            result = await future


if __name__ == '__main__':

    fids = c.execute('SELECT submission, selection FROM gn_intero.t_exports WHERE start=NULL ORDER BY submission ASC')
    for rec in fids:
        queue.put_nowait({'func': export_csv, 'args': (rec.submission, rec.selection)})

    loop.run_until_complete(run())

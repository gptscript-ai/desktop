/*
Based on Queue.js

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode
*/

interface IQueue<T> {
  size   : ()=> number
  isEmpty: ()=> boolean
  enqueue: (item: T)=> void
  dequeue: ()=> T | undefined
  peek   : ()=> T | undefined
  clear  : ()=> void
}

export default class Queue<T> implements IQueue<T> {
  private q: T[] = []
  private offset = 0

  size(): number {
    return this.q.length - this.offset
  }

  isEmpty(): boolean {
    return this.q.length === 0
  }

  enqueue(entry: T): void {
    this.q.push(entry)
  }

  dequeue(): T | undefined {
    // if the queue is empty, return immediately
    if (this.q.length === 0) {
      return undefined
    }

    // store the item at the front of the queue
    const item = this.q[this.offset]

    // increment the offset and remove the free space if necessary
    if (++this.offset * 2 >= this.q.length) {
      this.q = this.q.slice(this.offset)
      this.offset = 0
    }

    // return the dequeued item
    return item
  }

  peek(): T | undefined {
    return (this.q.length > 0 ? this.q[this.offset] : undefined)
  }

  clear(): void {
    this.offset = 0
    this.q.length = 0
  }
}

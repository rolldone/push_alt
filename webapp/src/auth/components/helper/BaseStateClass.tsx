import { Dispatch, SetStateAction } from "react"

export default class BaseStateClass<T, X> {
    declare props: X
    declare state: T
    declare originSetState: Dispatch<SetStateAction<T>>
    setState: { (state: Partial<T> | T): void } = (stateProps) => {
        this.state = {
            ...this.state,
            ...stateProps
        }
        this.originSetState(this.state)
    }

    getDefaultState(): T {
        return {} as T
    }

    constructor(state?: [Partial<T> | T, Dispatch<SetStateAction<any>>], props?: X) {
        if (state == null) return
        if (props == null) return
        this.state = state[0] as T
        this.originSetState = state[1]
        this.props = props || {} as any
    }
    defineState(state: [Partial<T> | T, Dispatch<SetStateAction<any>>], props: X) {
        this.state = state[0] as T
        this.originSetState = state[1]
        this.props = props || {} as any
    }
}
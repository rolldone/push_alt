import { useEffect, useMemo, useState } from "react";
import BaseStateClass from "../helper/BaseStateClass";

type colorStatus = "red" | "green" | ""
interface MessageCardProps {
    onInit: { (props: MessageCardClass): void }
    className?: string
}

interface MessageCardState {
    title_text: string
    body_text: string
    status: colorStatus
}

export class MessageCardClass extends BaseStateClass<MessageCardState, MessageCardProps> {
    showMessage(title: string, body: string, status: colorStatus) {
        this.setState({
            title_text: title,
            body_text: body,
            status: status
        })
    }
}

export default function MessageCard(props: MessageCardProps) {
    let methods = useMemo(() => new MessageCardClass(), []);

    methods.defineState(useState<MessageCardState>({
        body_text: "",
        status: "",
        title_text: ""
    }), props);

    useEffect(() => {
        props.onInit(methods);
    }, [])

    const { title_text, body_text, status } = methods.state;
    let colorClass = "card-status-start "
    switch (status) {
        case "green":
            colorClass += "bg-green"
            break;
        case "red":
            colorClass += "bg-red"
            break;
        default:
            return <></>
    }

    return <div className={"card "+props.className}>
        <div className={colorClass}></div>
        <div className="card-body">
            <h3 className="card-title">{title_text}</h3>
            <p className="text-secondary">
                {body_text}
            </p>
        </div>
    </div>
}
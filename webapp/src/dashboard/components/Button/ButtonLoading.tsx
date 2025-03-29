import { Button, Spinner } from "react-bootstrap";

export default function ButtonLoading(props: {
    http_status: "pending" | "done" | "failed"
    onClick: { (props?: any): void }
    children?: any
    text?: string
}) {
    return <Button variant="primary" onClick={props.onClick.bind(props)} disabled={props.http_status == "pending"}>
        {props.http_status == "pending" ? (
            <>
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                />
                {props.children}
            </>
        ) : <>
            {props.text || "Submit"}
        </>}
    </Button>
}
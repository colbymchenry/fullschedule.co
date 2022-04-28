export const AvatarSVG = (props) => (
    <svg style={props.style} width={props.width || "1em"} height={props.height || "1em"} viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={`rs-icon ${props.className}`}
         aria-label="avatar" data-category="legacy" fill="currentColor" xmlns="http://www.w3.org/2000/svg">>
        <path
            d="M24.565 8.565c0 4.73-3.834 8.565-8.565 8.565A8.565 8.565 0 1116 0a8.565 8.565 0 018.565 8.565zM16 17.726C8.117 17.726 1.726 24.119 1.726 32h28.549c0-7.881-6.391-14.274-14.274-14.274z"></path>
    </svg>
)
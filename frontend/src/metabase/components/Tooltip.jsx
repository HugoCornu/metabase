import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

import TooltipPopover from "./TooltipPopover.jsx";

export default class Tooltip extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isOpen: false,
            isHovered: false
        };
    }

    static propTypes = {
        tooltip: PropTypes.node,
        children: PropTypes.element.isRequired,
        isEnabled: PropTypes.bool,
        verticalAttachments: PropTypes.array,
        isOpen: PropTypes.bool
    };

    static defaultProps = {
        isEnabled: true,
        verticalAttachments: ["top", "bottom"]
    };

    componentDidMount() {
        let elem = ReactDOM.findDOMNode(this);

        elem.addEventListener("mouseenter", this._onMouseEnter, false);
        elem.addEventListener("mouseleave", this._onMouseLeave, false);

        // HACK: These two event listeners ensure that if a click on the child causes the tooltip to
        // unmount (e.x. navigating away) then the popover is removed by the time this component
        // unmounts. Previously we were seeing difficult to debug error messages like
        // "Cannot read property 'componentDidUpdate' of null"
        elem.addEventListener("mousedown", this._onMouseDown, true);
        elem.addEventListener("mouseup", this._onMouseUp, true);

        this._element = document.createElement('div');
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        const { isEnabled, tooltip } = this.props;
        const isOpen = this.props.isOpen != null ? this.props.isOpen : this.state.isOpen;
        if (tooltip && isEnabled && isOpen) {
            ReactDOM.render(
                <TooltipPopover isOpen={true} target={this} {...this.props} children={this.props.tooltip} />,
                this._element
            );
        } else {
            ReactDOM.unmountComponentAtNode(this._element);
        }
    }

    componentWillUnmount() {
        let elem = ReactDOM.findDOMNode(this);
        elem.removeEventListener("mouseenter", this._onMouseEnter, false);
        elem.removeEventListener("mouseleave", this._onMouseLeave, false);
        elem.removeEventListener("mousedown", this._onMouseDown, true);
        elem.removeEventListener("mouseup", this._onMouseUp, true);
        ReactDOM.unmountComponentAtNode(this._element);
        clearTimeout(this.timer);
    }

    _onMouseEnter = (e) => {
        this.setState({ isOpen: true, isHovered: true });
    }

    _onMouseLeave = (e) => {
        this.setState({ isOpen: false, isHovered: false });
    }

    _onMouseDown = (e) => {
        this.setState({ isOpen: false });
    }

    _onMouseUp = (e) => {
        // This is in a timeout to ensure the component has a chance to fully unmount
        this.timer = setTimeout(() =>
            this.setState({ isOpen: this.state.isHovered })
        , 0);
    }

    render() {
        return React.Children.only(this.props.children);
    }
}

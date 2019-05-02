import React from "react";
import PropTypes from "prop-types";
import {
  DatePickerIOS,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";
import Moment from 'moment';
import ReactNativeModal from "react-native-modal";
import { isIphoneX } from "./utils";

export default class CustomDatePickerIOS extends React.PureComponent {
  static propTypes = {
    cancelTextIOS: PropTypes.string,
    cancelTextStyle: PropTypes.any,
    confirmTextIOS: PropTypes.string,
    confirmTextStyle: PropTypes.any,
    setMaxDefaultDate: PropTypes.bool,
    contentContainerStyleIOS: PropTypes.any,
    customCancelButtonIOS: PropTypes.node,
    customConfirmButtonIOS: PropTypes.node,
    customConfirmButtonWhileInteractingIOS: PropTypes.node,
    customDatePickerIOS: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    customTitleContainerIOS: PropTypes.node,
    dismissOnBackdropPressIOS: PropTypes.bool,
    hideTitleContainerIOS: PropTypes.bool,
    isVisible: PropTypes.bool,
    date: PropTypes.instanceOf(Date),
    datePickerContainerStyleIOS: PropTypes.any,
    mode: PropTypes.oneOf(["date", "time", "datetime"]),
    neverDisableConfirmIOS: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onDateChange: PropTypes.func,
    onHideAfterConfirm: PropTypes.func,
    pickerRefCb: PropTypes.func,
    reactNativeModalPropsIOS: PropTypes.any,
    titleIOS: PropTypes.string,
    titleStyle: PropTypes.any
  };

  static defaultProps = {
    cancelTextIOS: "Cancel",
    confirmTextIOS: "Confirm",
    date: new Date(),
    dismissOnBackdropPressIOS: true,
    hideTitleContainerIOS: false,
    isVisible: false,
    mode: "date",
    setMaxDefaultDate: false,
    neverDisableConfirmIOS: false,
    onHideAfterConfirm: () => {},
    onDateChange: () => {},
    reactNativeModalPropsIOS: {},
    titleIOS: "Pick a date"
  };


  state = {
    date: this.setDefaultDateTime(),
    userIsInteractingWithPicker: false,
    dateChanged: false,
    minuteInterval: this.props.minuteInterval || 1
  };

  setDefaultDateTime(){
    const { setMaxDefaultDate, maximumDate, date } = this.props;
    return setMaxDefaultDate ? maximumDate : date
  }

  componentWillReceiveProps(nextProps) {
    if(String(this.props.date) !== String(nextProps.date)){
      this.setState({
        dateChanged: true,
        date: nextProps.date
      });
    } 
  }

  handleCancel = () => {
    this.confirmed = false;
    this.props.onCancel();
    this.resetDate();
  };

  handleConfirm = () => {
    const { mode, maximumDate, onConfirm } = this.props;
    const { date } = this.state;
    this.confirmed = true;
    const isAfter = Moment(maximumDate).isAfter(date);
    onConfirm(!isAfter && mode === 'time' ? maximumDate : date);
    this.resetDate();
  };

  resetDate = () => {
    const { dateChanged } = this.state;
    const { setMaxDefaultDate, maximumDate, date } = this.props;
    this.setState({
      date: !dateChanged && setMaxDefaultDate ? maximumDate :  date
    });
  };

  handleModalShow = () => {
    this.setState({ minuteInterval: this.props.minuteInterval });
  };

  handleModalHide = () => {
    if (this.confirmed) {
      this.props.onHideAfterConfirm(this.state.date);
    }
  };

  handleDateChange = date => {
    this.setState({
      date,
      userIsInteractingWithPicker: false
    });
    this.props.onDateChange(date);
  };

  handleUserTouchInit = () => {
    if (!this.props.customDatePickerIOS) {
      this.setState({
        userIsInteractingWithPicker: true
      });
    }
    return false;
  };

  render() {
    const {
      cancelTextIOS,
      cancelTextStyle,
      confirmTextIOS,
      confirmTextStyle,
      contentContainerStyleIOS,
      customCancelButtonIOS,
      customConfirmButtonIOS,
      customConfirmButtonWhileInteractingIOS,
      customDatePickerIOS,
      customTitleContainerIOS,
      datePickerContainerStyleIOS,
      dismissOnBackdropPressIOS,
      hideTitleContainerIOS,
      isVisible,
      minuteInterval,
      mode,
      neverDisableConfirmIOS,
      pickerRefCb,
      reactNativeModalPropsIOS,
      titleIOS,
      titleStyle,
      ...otherProps
    } = this.props;

    const titleContainer = (
      <View style={styles.titleContainer}>
        <Text style={[styles.title, titleStyle]}>{titleIOS}</Text>
      </View>
    );
    let confirmButton;
    if (customConfirmButtonIOS) {
      if (
        customConfirmButtonWhileInteractingIOS &&
        this.state.userIsInteractingWithPicker
      ) {
        confirmButton = customConfirmButtonWhileInteractingIOS;
      } else {
        confirmButton = customConfirmButtonIOS;
      }
    } else {
      confirmButton = (
        <Text style={[styles.confirmText, confirmTextStyle]}>
          {confirmTextIOS}
        </Text>
      );
    }
    const cancelButton = (
      <Text style={[styles.cancelText, cancelTextStyle]}>{cancelTextIOS}</Text>
    );
    const DatePickerComponent = customDatePickerIOS || DatePickerIOS;

    const reactNativeModalProps = {
      onBackdropPress: dismissOnBackdropPressIOS
        ? this.handleCancel
        : () => null,
      reactNativeModalPropsIOS
    };

    return (
      <ReactNativeModal
        isVisible={isVisible}
        style={[styles.contentContainer, contentContainerStyleIOS]}
        onModalHide={this.handleModalHide}
        onModalShow={this.handleModalShow}
        backdropOpacity={0.4}
        {...reactNativeModalProps}
      >
        <View style={[styles.datepickerContainer, datePickerContainerStyleIOS]}>
          {!hideTitleContainerIOS &&
            (customTitleContainerIOS || titleContainer)}
          <View
            onStartShouldSetResponderCapture={
              neverDisableConfirmIOS !== true ? this.handleUserTouchInit : null
            }
          >
            <DatePickerComponent
              ref={pickerRefCb}
              mode={mode}
              minuteInterval={this.state.minuteInterval}
              {...otherProps}
              date={this.state.date}
              onDateChange={this.handleDateChange}
            />
            
          </View>
          <TouchableHighlight
            style={styles.confirmButton}
            underlayColor={HIGHLIGHT_COLOR}
            onPress={this.handleConfirm}
            disabled={
              !neverDisableConfirmIOS && this.state.userIsInteractingWithPicker
            }
          >
            {confirmButton}
          </TouchableHighlight>
        </View>

        <TouchableHighlight
          style={styles.cancelButton}
          underlayColor={HIGHLIGHT_COLOR}
          onPress={this.handleCancel}
        >
          {customCancelButtonIOS || cancelButton}
        </TouchableHighlight>
      </ReactNativeModal>
    );
  }
}

const BORDER_RADIUS = 13;
const BACKGROUND_COLOR = "white";
const BORDER_COLOR = "#d5d5d5";
const TITLE_FONT_SIZE = 13;
const TITLE_COLOR = "#8f8f8f";
const BUTTON_FONT_WEIGHT = "normal";
const BUTTON_FONT_COLOR = "#007ff9";
const BUTTON_FONT_SIZE = 20;
const HIGHLIGHT_COLOR = "#ebebeb";

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: "flex-end",
    margin: 10
  },
  datepickerContainer: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: BORDER_RADIUS,
    marginBottom: 8,
    overflow: "hidden"
  },
  titleContainer: {
    borderBottomColor: BORDER_COLOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 14,
    backgroundColor: "transparent"
  },
  title: {
    textAlign: "center",
    color: TITLE_COLOR,
    fontSize: TITLE_FONT_SIZE
  },
  confirmButton: {
    borderColor: BORDER_COLOR,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: "transparent",
    height: 57,
    justifyContent: "center"
  },
  confirmText: {
    textAlign: "center",
    color: BUTTON_FONT_COLOR,
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: BUTTON_FONT_WEIGHT,
    backgroundColor: "transparent"
  },
  cancelButton: {
    backgroundColor: BACKGROUND_COLOR,
    borderRadius: BORDER_RADIUS,
    height: 57,
    marginBottom: isIphoneX() ? 20 : 0,
    justifyContent: "center"
  },
  cancelText: {
    padding: 10,
    textAlign: "center",
    color: BUTTON_FONT_COLOR,
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: "600",
    backgroundColor: "transparent"
  }
});
import React, { RefObject, useEffect, useState } from "react";
import { PostLogin } from "../component/Header";
import {
  Button,
  Dimmer,
  Loader,
  Placeholder,
  Progress,
} from "semantic-ui-react";
import iconArrowGray from "../assets/images/arrow-collapse-gray.svg";
import iconArrowBlue from "../assets/images/arrow-collapse-blue.svg";
import iconOkImg from "../assets/images/icon-tick-green.svg";
import iconOkGrayImg from "../assets/images/icon-tick-gray.svg";
import { getHttpQueryParam } from "../utility/http";
import "../style/css/get-started.css";
import { OnboardingProgressType } from "../component/GettingStarted/OnboardingProgressType";
import { post } from "../api/apiRequest";
import { POST_COMPANY_FIELD } from "../api/apiPath";
import { TaskType } from "../component/GettingStarted/TaskType";
import {
  collapseSection,
  scrollToY,
  uncollapseSection,
} from "../component/GettingStarted/effects/animations";
import CompanyType, { CompanyCustomFieldsType } from "../types/CompanyType";
import Helmet from "react-helmet";
import { useFlashMessageChannel } from "../component/BannerMessage/flashBannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { useOnboardingTasksLocalized } from "../component/GettingStarted/useOnboardingTasksLocalized";
import { clone, pick } from "ramda";
import { useAppDispatch, useAppSelector } from "../AppRootContext";
import { fetchOnboardingProgress } from "../api/Onboarding/fetchOnboardingProgress";

function isTaskEntirelyComplete(task: TaskType): boolean {
  return task.completed;
}

function updateTaskFromAPI(
  task: TaskType,
  progressData: OnboardingProgressType
) {
  const updatedTask = { ...task };
  if (task.apiName && progressData[task.apiName] !== undefined) {
    updatedTask.completed = progressData[task.apiName];
  }

  return updatedTask;
}

function isTaskCollapsed(task: TaskType) {
  return isTaskEntirelyComplete(task);
}

function tasksPercentage(tasks: TaskType[]) {
  if (tasks.length === 0) {
    return 100;
  }

  const completedTasks = tasks.filter((t) => t.completed);
  return Math.ceil((completedTasks.length / tasks.length) * 100);
}

async function initialCompanyWidgetCustomField(
  param: CompanyCustomFieldsType[]
) {
  const companyUpdated = await post(POST_COMPANY_FIELD, {
    param,
  });
  return companyUpdated;
}

function updateOnboardingProgress(
  task: TaskType,
  allTasks: TaskType[],
  value: boolean
) {
  if (!task.apiName) {
    throw new Error(`Add apiName to task ${task.name}`);
  }
  if (!task.storedInCompanyCustomFields) {
    throw new Error(`Task ${task.name} is not stored by API`);
  }
  let newFieldValues = allTasks
    .filter((task) => task.storedInCompanyCustomFields)
    .reduce((values, next): object => {
      if (next.apiName) {
        values[next.apiName] = next.completed;
      }
      return values;
    }, {});

  newFieldValues[task.apiName] = value;

  return post(POST_COMPANY_FIELD, {
    param: [
      {
        Category: "OnboardingProgress",
        FieldName: "OnboardingProgressState",
        Value: JSON.stringify(newFieldValues),
        Type: "Json",
      },
    ],
  });
}

function openNextIncompleteTask(apiTasksState: TaskType[]) {
  const firstIncompleteTaskIndex = apiTasksState.findIndex(
    (t) => !isTaskEntirelyComplete(t)
  );
  let taskCollapses = Array(apiTasksState.length).fill(true);
  taskCollapses.splice(firstIncompleteTaskIndex, 1, false);

  return taskCollapses;
}

export default Tutorial;

function Tutorial() {
  const { user, profile, currentStaff, company } = useAppSelector(
    pick(["user", "company", "profile", "currentStaff"])
  );
  const loginDispatch = useAppDispatch();
  const { tasks } = useOnboardingTasksLocalized();
  const [tasksState, setTasksState] = useState(clone(tasks));
  const [tasksCollapses, setTasksCollapses] = useState<boolean[]>(
    tasksState.map(isTaskCollapsed)
  );
  const [progressLoaded, setProgressLoaded] = useState<boolean>(false);
  const [progressUpdated, setProgressUpdated] = useState<boolean>(false);
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();

  useEffect(() => {
    const verifyEmail = getHttpQueryParam("verifyEmail");
    if (verifyEmail) {
      // flash(t("flash.onboarding.verifyEmail"), 24 * 60 * 60000);
      flash(t("flash.onboarding.verifyEmail"));
    }
  }, []);

  useEffect(() => {
    function byName(name: string) {
      return (fld: CompanyCustomFieldsType) =>
        fld.fieldName.toLowerCase() === name;
    }

    if (company && company.companyCustomFields) {
      const fields = company.companyCustomFields;
      const welcomeMessage = fields.find(byName("welcomemessage"));
      const tagLine = fields.find(byName("livechatdescription"));
      const autoReply = fields.find(byName("autoreplymessage"));
      const companyBackgroundColor = fields.find(
        byName("livechatbackgroundcolor")
      );
      const companyFontColor = fields.find(byName("livechatfontcolor"));
      const pageTitle = fields.find(byName("livechatpagetitle"));
      const liveChatTitle = fields.find(byName("livechatlivechattitle"));
      const socialConversationTitle = fields.find(
        byName("livechatsocialconversationtitle")
      );
      const liveChatGreeting = fields.find(byName("livechatgreeting"));
      const liveChatIconColor = fields.find(byName("livechaticoncolor"));
      let param: CompanyCustomFieldsType[] = [];

      if (!welcomeMessage) {
        param = [
          ...param,
          {
            category: "Messaging",
            fieldName: "WelcomeMessage",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: t("onboarding.field.messaging.welcome"),
            isEditable: true,
            isVisible: true,
          },
        ];
      }
      if (!tagLine) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatDescription",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: t("onboarding.field.liveChat.description", {
              name: company.companyName,
            }),
            isEditable: true,
            isVisible: true,
          },
        ];
      }
      if (!autoReply) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "AutoReplyMessage",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: t("onboarding.field.liveChat.autoreply"),
            isEditable: true,
            isVisible: true,
          },
        ];
      }
      if (!companyBackgroundColor) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatBackgroundColor",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: "rgba(48,80,140,1)",
            isVisible: true,
            isEditable: true,
          },
        ];
      }
      if (!companyFontColor) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatFontColor",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: "rgba(255,255,255,1)",
            isVisible: true,
            isEditable: true,
          },
        ];
      }
      if (!pageTitle) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatPageTitle",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: t("onboarding.field.liveChat.pageTitle"),
            isVisible: true,
            isEditable: true,
          },
        ];
      }
      if (!liveChatTitle) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatLiveChatTitle",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: t("onboarding.field.liveChat.chatTitle"),
            isEditable: true,
            isVisible: true,
          },
        ];
      }
      if (!socialConversationTitle) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatSocialConversationTitle",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: t("onboarding.field.liveChat.socialTitle"),
            isEditable: true,
            isVisible: true,
          },
        ];
      }
      if (!liveChatGreeting) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatGreeting",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: t("onboarding.field.liveChat.greeting"),
            isEditable: true,
            isVisible: true,
          },
        ];
      }
      if (!liveChatIconColor) {
        param = [
          ...param,
          {
            category: "LiveChat",
            fieldName: "LiveChatIconColor",
            companyCustomFieldFieldLinguals: [],
            type: "SingleLineText",
            value: "rgba(48,80,140,1)",
            isEditable: true,
            isVisible: true,
          },
        ];
      }
      if (param.length > 0) {
        initialCompanyWidgetCustomField(param).then(
          (updatedCompany: CompanyType) => {
            console.debug("updatedCompanyupdatedCompany", updatedCompany);
            loginDispatch({
              type: "UPDATE_COMPANY_INFO",
              company: updatedCompany,
            });
          }
        );
      }
    }
  }, [JSON.stringify(company)]);

  useEffect(() => {
    fetchOnboardingProgress().then((progressData: OnboardingProgressType) => {
      const apiTasksState = tasksState.map((task) =>
        updateTaskFromAPI(task, progressData)
      );
      setTasksState(apiTasksState);
      setTasksCollapses(openNextIncompleteTask(apiTasksState));
      setProgressLoaded(true);
    });
  }, [user.accessToken]);

  function handleTaskToggleClick(taskIndex: number) {
    setTasksCollapses((collapses) => {
      const updated = [...collapses];
      updated[taskIndex] = !collapses[taskIndex];
      return updated;
    });
  }

  async function completeManually(taskIndex: number) {
    const taskCompleted = { ...tasksState[taskIndex] };
    if (taskCompleted.subtasks) {
      taskCompleted.subtasks = taskCompleted.subtasks.map((s) => ({
        ...s,
        completed: true,
      }));
    }
    try {
      // just send update in background, no dealing with effects
      updateOnboardingProgress(taskCompleted, tasksState, true);
    } catch (err) {
      console.error("updateOnboardingProgress:error", err);
    }
    const updatedTasksState = [...tasksState];
    updatedTasksState.splice(taskIndex, 1, {
      ...taskCompleted,
      completed: true,
    });

    setTasksState(updatedTasksState);
    setTasksCollapses(openNextIncompleteTask(updatedTasksState));
    setProgressUpdated(true);
  }

  function scrollNextStep(index: number, taskRef: RefObject<HTMLDivElement>) {
    const taskOpenIndex = tasksCollapses.findIndex((collapsed) => !collapsed);
    if (taskOpenIndex === index && taskRef.current) {
      scrollToY(taskRef.current);
      setProgressUpdated(false);
    }
  }

  const displayName = currentStaff
    ? currentStaff.userInfo.displayName
    : profile.displayName;
  const pageTitle = t("nav.menu.onboarding");

  return (
    <div className="post-login">
      <PostLogin selectedItem={"Get Started"} />
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <div className="main">
        <div className="main-primary-column">
          <div className="get-started">
            <section className="steps">
              <h4 className={"get-started__page-header"}>
                <span className="wrap">{t("onboarding.title")}</span>
              </h4>
              <div className="step-stack opened">
                <article className="step summary">
                  <div className="summary-body">
                    <div className="text-block">
                      <header className={"step-header-name"}>
                        {t("onboarding.subtitle", { name: displayName })}
                      </header>
                      <p>{t("onboarding.intro")}</p>
                    </div>
                    <div className={`step-progress`}>
                      <Dimmer.Dimmable dimmed={!progressLoaded}>
                        <div className="title">{t("onboarding.progress")}:</div>
                        <Progress
                          size={"medium"}
                          value={tasksPercentage(tasksState)}
                          total={100}
                          progress={"percent"}
                          precision={0}
                        />
                        <Dimmer active={!progressLoaded} inverted>
                          <Loader active />
                        </Dimmer>
                      </Dimmer.Dimmable>
                    </div>
                  </div>
                </article>
              </div>
              {progressLoaded ? (
                <TaskList
                  companyId={company ? company.id : ""}
                  tasks={tasksState}
                  handleTaskToggleClick={handleTaskToggleClick}
                  handleTaskCompleteClick={completeManually}
                  tasksCollapses={tasksCollapses}
                  progressUpdated={progressUpdated}
                  scrollNextStep={scrollNextStep}
                />
              ) : (
                <TaskDummies tasks={tasksState} />
              )}
              <footer className={"footer"}>
                <p>
                  <Trans i18nKey={"onboarding.helpTip"}>
                    Tip: you can see all tutorial guides by clicking
                    <a
                      href={
                        "https://docs.sleekflow.io/getting-started/start-exploring"
                      }
                      target={"_blank"}
                    >
                      here
                    </a>
                  </Trans>
                </p>
              </footer>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskDummies(props: { tasks: TaskType[] }) {
  return (
    <>
      {props.tasks.map((task, ind) => (
        <div className={`step-stack collapsed`} key={`task${ind}`}>
          <div className="collapse-wrap">
            <div className="step step-top">
              <div className="step-header">
                <div className="step-header-status step-header-status_loading">
                  <Loader active inline />
                </div>
                <div className="step-header-name">
                  <Placeholder>
                    <Placeholder.Header>
                      <Placeholder.Line />
                    </Placeholder.Header>
                  </Placeholder>
                </div>
                <div className="step-header-time" style={{ width: "200px" }}>
                  <Placeholder>
                    <Placeholder.Paragraph>
                      <Placeholder.Line length={"full"} />
                    </Placeholder.Paragraph>
                  </Placeholder>
                </div>
                <div className="step-header-collapse-trigger-wrap">
                  <div className="step-header-collapse-trigger">&nbsp;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function TaskList(props: {
  tasks: TaskType[];
  companyId: string;
  handleTaskToggleClick: (ind: any) => any;
  handleTaskCompleteClick: (ind: any) => any;
  tasksCollapses: boolean[];
  scrollNextStep: (index: number, taskRef: RefObject<HTMLDivElement>) => any;
  progressUpdated: boolean;
}) {
  return (
    <>
      {props.tasks.map((task, ind) => {
        return (
          <TaskItem
            key={`task${ind}`}
            collapsed={props.tasksCollapses[ind]}
            ind={ind}
            task={task}
            companyId={props.companyId}
            progressUpdated={props.progressUpdated}
            scrollNextStep={props.scrollNextStep}
            onClick={() => props.handleTaskToggleClick(ind)}
            manualComplete={(event) => {
              event.preventDefault();
              props.handleTaskCompleteClick(ind);
            }}
          />
        );
      })}
    </>
  );
}

function TaskItem(props: {
  collapsed: boolean;
  ind: number;
  task: TaskType;
  onClick: () => any;
  manualComplete: (event: any) => void;
  progressUpdated: boolean;
  companyId?: string;
  scrollNextStep: (index: number, taskRef: RefObject<HTMLDivElement>) => any;
}) {
  let taskRef = React.createRef<HTMLDivElement>();
  let curtainRef = React.createRef<HTMLDivElement>();
  let measureRef = React.createRef<HTMLDivElement>();
  const { progressUpdated, ind, scrollNextStep, companyId } = props;
  const { manualComplete, task, onClick, collapsed } = props;
  const [collapseHovered, setCollapseHovered] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!progressUpdated) {
      return;
    }
    scrollNextStep(ind, taskRef);
  }, [progressUpdated]);

  useEffect(() => {
    if (!(curtainRef.current && measureRef.current)) {
      return;
    }
    if (props.collapsed) {
      collapseSection(curtainRef.current);
    } else {
      uncollapseSection(curtainRef.current, measureRef.current);
    }
  }, [collapsed]);

  let isCompletedTick: boolean;
  if (task.dependsOnSubtasks) {
    isCompletedTick = isTaskEntirelyComplete(task);
  } else {
    isCompletedTick = task.completed;
  }

  return (
    <div
      className={`step-stack ${collapsed ? "collapsed" : "opened"}`}
      ref={taskRef}
    >
      <div
        className={`step step-top ${isCompletedTick ? "step-completed" : ""}`}
      >
        <div
          className={`step-header ${collapseHovered ? "collapse-hovered" : ""}`}
        >
          <div className="step-header-status">
            {isCompletedTick ? (
              <img src={iconOkImg} alt="" />
            ) : (
              <img src={iconOkGrayImg} alt="" />
            )}
          </div>
          <div className="step-header-name">{task.name}</div>
          <div
            className="step-header-time"
            onMouseOver={() => setCollapseHovered(true)}
            onMouseOut={() => setCollapseHovered(false)}
            onClick={onClick}
          >
            {task.timeToComplete}
          </div>
          <div className="step-header-collapse-trigger-wrap">
            <div
              className="step-header-collapse-trigger"
              onMouseOver={() => setCollapseHovered(true)}
              onMouseOut={() => setCollapseHovered(false)}
              onClick={onClick}
            >
              <img src={iconArrowGray} alt="" className={"arrow-gray"} />
              <img src={iconArrowBlue} alt="" className={"arrow-blue"} />
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-wrap" ref={curtainRef}>
        <div className="collapse-inner" ref={measureRef}>
          <div className={`step ${isCompletedTick ? "step-completed" : ""}`}>
            <div className="step-body">
              <div className="text-block">
                {task.body}
                {task.buttonText && task.buttonUrl && (
                  <div className={"actions"}>
                    <Button as={"a"} href={task.buttonUrl} target={"_blank"}>
                      {task.buttonText}
                    </Button>
                  </div>
                )}
                {!task.completed && task.mightBeMarkedAsComplete && (
                  <a className={"complete-link"} onClick={manualComplete}>
                    {t("onboarding.button.markDone")}
                  </a>
                )}
              </div>
              <div className={"splash"}>
                {task.splash ? (
                  <img src={task.splash} alt={task.name} />
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
            </div>
          </div>
          {task.subtasks &&
            task.subtasks.map((subtask, sind) => {
              return (
                <div
                  className={`step child ${
                    isCompletedTick && "step-completed"
                  }`}
                  key={`subtask${sind}`}
                >
                  <div className="step-header">
                    <div className="step-header-status">&nbsp;</div>
                    <div className="step-header-name">{subtask.name}</div>
                    <div className="step-header-time">&nbsp;</div>
                    <div className="step-header-collapse-trigger-wrap">
                      <div className="step-header-collapse-trigger empty">
                        <span>&nbsp;</span>
                      </div>
                    </div>
                  </div>
                  <div className="step-body">
                    <div className="text-block">
                      {subtask.body}
                      {subtask.buttonText && (
                        <div className={"actions"}>
                          <Button
                            as={"a"}
                            href={
                              subtask.buttonUrl
                                ? subtask.buttonUrl.replace(
                                    "{companyId}",
                                    companyId || ""
                                  )
                                : "#"
                            }
                            target={"_blank"}
                            content={subtask.buttonText}
                          />
                        </div>
                      )}
                    </div>
                    <div className={"splash splash-empty"}>
                      <span>&nbsp;</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

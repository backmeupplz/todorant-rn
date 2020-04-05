package com.todorant;

import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

import org.junit.Rule;
import org.junit.ClassRule;
import org.junit.Test;

import tools.fastlane.screengrab.Screengrab;
import tools.fastlane.screengrab.UiAutomatorScreenshotStrategy;
import tools.fastlane.screengrab.locale.LocaleTestRule;
import tools.fastlane.screengrab.locale.LocaleUtil;

import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withContentDescription;
import static androidx.test.espresso.matcher.ViewMatchers.withTagValue;
import static org.hamcrest.CoreMatchers.allOf;
import static org.hamcrest.Matchers.is;

@LargeTest
public class AppTest {
    @ClassRule
    public static final LocaleTestRule localeTestRule = new LocaleTestRule();

    @Rule
    public ActivityTestRule<MainActivity> mActivityTestRule = new ActivityTestRule<>(MainActivity.class);

    @Test
    public void appTest() {
        Screengrab.setDefaultScreenshotStrategy(new UiAutomatorScreenshotStrategy());

        try {
            Thread.sleep(20000);
        } catch (InterruptedException e) {

        }

        Screengrab.screenshot("0Empty");

        if (LocaleUtil.getTestLocale().getLanguage().equals("ru")) {
            onView(allOf(withContentDescription("Настройки, tab, 3 of 3"), isDisplayed())).perform(click());

            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }

            onView(withTagValue(is("delete"))).perform(click());
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }

            onView(withTagValue(is("add_ru"))).perform(click());
            try {
                Thread.sleep(8000);
            } catch (InterruptedException e) {

            }

            onView(allOf(withContentDescription("Текущее, tab, 1 of 3"), isDisplayed())).perform(click());
            Screengrab.screenshot("1Current");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }
            onView(allOf(withContentDescription("Планирование, tab, 2 of 3"), isDisplayed())).perform(click());
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }
            Screengrab.screenshot("2Planning");

        } else if (LocaleUtil.getTestLocale().getLanguage().equals("uk")) {
            onView(allOf(withContentDescription("Налаштування, tab, 3 of 3"), isDisplayed())).perform(click());

            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }

            onView(withTagValue(is("delete"))).perform(click());
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }

            onView(withTagValue(is("add_uk"))).perform(click());
            try {
                Thread.sleep(8000);
            } catch (InterruptedException e) {

            }

            onView(allOf(withContentDescription("Поточне, tab, 1 of 3"), isDisplayed())).perform(click());
            Screengrab.screenshot("1Current");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }
            onView(allOf(withContentDescription("Планування, tab, 2 of 3"), isDisplayed())).perform(click());
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }
            Screengrab.screenshot("2Planning");

        } else {
            onView(allOf(withContentDescription("Settings, tab, 3 of 3"), isDisplayed())).perform(click());

            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }

            onView(withTagValue(is("delete"))).perform(click());
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }

            onView(withTagValue(is("add_en"))).perform(click());
            try {
                Thread.sleep(8000);
            } catch (InterruptedException e) {

            }

            onView(allOf(withContentDescription("Current, tab, 1 of 3"), isDisplayed())).perform(click());
            Screengrab.screenshot("1Current");
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }
            onView(allOf(withContentDescription("Planning, tab, 2 of 3"), isDisplayed())).perform(click());try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {

            }

            Screengrab.screenshot("2Planning");
        }
    }
}

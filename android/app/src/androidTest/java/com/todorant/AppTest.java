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

        try { Thread.sleep(25000); } catch (InterruptedException e) {}

        String settings = "Settings";
        String current = "Current";
        String planning = "Planning";
        String addTodoButton = "add_en";   

        if (LocaleUtil.getTestLocale().getLanguage().equals("ru")) {
            settings = "Настройки";
            current = "Текущее";
            planning = "Планирование";
            addTodoButton = "add_ru";
        } else if (LocaleUtil.getTestLocale().getLanguage().equals("uk")) {
            settings = "Налаштування";
            current = "Поточне";
            planning = "Планування";
            addTodoButton = "add_uk";
        } else if (LocaleUtil.getTestLocale().getLanguage().equals("it")) {
            settings = "Impostazioni";
            current = "Corrente";
            planning = "Pianificazione";
            addTodoButton = "add_it";
        } else if (LocaleUtil.getTestLocale().getLanguage().contains("es")) {
            settings = "Ajustes";
            current = "Actual";
            planning = "Planeación";
            addTodoButton = "add_es";
        } else if (LocaleUtil.getTestLocale().getLanguage().contains("pt")) {
            settings = "Configurações";
            current = "Atual";
            planning = "Planejamento";
            addTodoButton = "add_pt_br";
        }

        // Empty current
        Screengrab.screenshot("0Empty");
        // Add todos
        onView(allOf(withContentDescription(String.format("%s, tab, 3 of 3", settings)), isDisplayed())).perform(click());
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        onView(withTagValue(is(addTodoButton))).perform(click());
        try { Thread.sleep(8000); } catch (InterruptedException e) {}
        // Filled planning
        onView(allOf(withContentDescription(String.format("%s, tab, 2 of 3", planning)), isDisplayed())).perform(click());
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        Screengrab.screenshot("2Planning");
        // Filled current
        onView(allOf(withContentDescription(String.format("%s, tab, 1 of 3", current)), isDisplayed())).perform(click());
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        Screengrab.screenshot("1Current");
        // Dark mode
        onView(allOf(withContentDescription(String.format("%s, tab, 3 of 3", settings)), isDisplayed())).perform(click());
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        onView(withTagValue(is("turn_dark_on"))).perform(click());
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        onView(allOf(withContentDescription(String.format("%s, tab, 2 of 3", planning)), isDisplayed())).perform(click());
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        Screengrab.screenshot("3Dark");
    }
}

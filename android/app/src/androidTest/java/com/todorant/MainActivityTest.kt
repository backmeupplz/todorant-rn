package com.todorant


import android.view.View
import android.view.ViewGroup
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withContentDescription
import androidx.test.filters.LargeTest
import androidx.test.rule.ActivityTestRule
import androidx.test.runner.AndroidJUnit4
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.Matchers.allOf
import org.hamcrest.TypeSafeMatcher
import org.hamcrest.core.IsInstanceOf
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@LargeTest
@RunWith(AndroidJUnit4::class)
class MainActivityTest {

    @Rule
    @JvmField
    var mActivityTestRule = ActivityTestRule(MainActivity::class.java)

    @Test
    fun mainActivityTest() {
        Screengrab.screenshot("before_button_click");
//        val viewGroup = onView(
//                allOf(childAtPosition(
//                        allOf(withContentDescription("Settings, tab, 3 of 3"),
//                                childAtPosition(
//                                        IsInstanceOf.instanceOf(android.view.ViewGroup::class.java),
//                                        2)),
//                        1),
//                        isDisplayed()))
//        viewGroup.check(matches(isDisplayed()))


//        sleep(10)
//
//        snapshot("0Empty")
//        if deviceLanguage == "ru" {
//            app.buttons["Настройки, tab, 3 of 3"].tap()
//            sleep(2)
//            app.otherElements["delete"].tap()
//            sleep(2)
//            app.otherElements["add_ru"].tap()
//            sleep(2)
//            app.buttons["Текущее, tab, 1 of 3"].tap()
//            snapshot("1Current")
//            app.buttons["Планирование, tab, 2 of 3"].tap()
//            snapshot("2Planning")
//        } else {
//            app.buttons["Settings, tab, 3 of 3"].tap()
//            sleep(2)
//            app.otherElements["delete"].tap()
//            sleep(2)
//            app.otherElements["add_en"].tap()
//            sleep(2)
//            app.buttons["Current, tab, 1 of 3"].tap()
//            snapshot("1Current")
//            app.buttons["Planning, tab, 2 of 3"].tap()
//            snapshot("2Planning")
//        }
    }

    private fun childAtPosition(
            parentMatcher: Matcher<View>, position: Int): Matcher<View> {

        return object : TypeSafeMatcher<View>() {
            override fun describeTo(description: Description) {
                description.appendText("Child at position $position in parent ")
                parentMatcher.describeTo(description)
            }

            public override fun matchesSafely(view: View): Boolean {
                val parent = view.parent
                return parent is ViewGroup && parentMatcher.matches(parent)
                        && view == parent.getChildAt(position)
            }
        }
    }
}
